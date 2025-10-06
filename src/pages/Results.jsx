import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiActivity, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import ProgressBar from '../components/ProgressBar'

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const initialDocument = state?.document || null
  const primaryFile = state?.files?.[0]

  const [document, setDocument] = useState(initialDocument)
  const [codes, setCodes] = useState(() => buildInitialCodes(initialDocument))
  const [notes, setNotes] = useState(initialDocument?.ClinicalSummary || '')
  const [error, setError] = useState(null)

  const comprehendEntities = useMemo(() => parseComprehendEntities(document), [document])
  const unmappedAttributes = useMemo(() => parseUnmappedAttributes(document), [document])
  const hasIcdEntities = comprehendEntities.length > 0

  useEffect(() => {
    if (!document && primaryFile?.key) {
      let active = true
      async function fetchDocument() {
        try {
          const response = await fetch(`/api/documents?key=${encodeURIComponent(primaryFile.key)}`)
          if (!active) return
          if (!response.ok) {
            throw new Error('Unable to retrieve document data')
          }
          const payload = await response.json()
          setDocument(payload.document)
          setCodes(buildInitialCodes(payload.document))
          setError(null)
        } catch (err) {
          if (!active) return
          setError(err?.message || 'Unable to load ICD entities')
        }
      }
      fetchDocument()
      return () => { active = false }
    }
  }, [document, primaryFile?.key])

  useEffect(() => {
    setCodes(buildInitialCodes(document))
    if (document?.ClinicalSummary) {
      setNotes(document.ClinicalSummary)
    }
  }, [document])

  const totals = useMemo(() => {
    const all = [...codes.icd10]
    const avg = all.length
      ? Math.round((all.reduce((sum, row) => sum + (row.confidence || 0), 0) / all.length) * 100)
      : 0
    return {
      avg,
      totalCodes: comprehendEntities.length,
      totalRVU: 0,
      revenue: 0,
    }
  }, [codes, comprehendEntities.length])

  function save(confirm = true) {
    navigate('/history', { state: { justSaved: confirm } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Coding Results</h2>
          <p className="text-ink-500 text-sm">Review and validate AI-generated medical codes extracted from DynamoDB</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => save(true)}
          disabled={!hasIcdEntities}
        >
          Save & Confirm
        </button>
      </div>

      {error && (
        <div className="card border-danger text-danger px-4 py-3">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <SummaryTile label="Overall Accuracy" value={`${totals.avg}%`} icon={FiActivity}>
          <div className="mt-2">
            <ProgressBar value={totals.avg} size="sm" />
          </div>
        </SummaryTile>
        <SummaryTile label="Total Codes" value={totals.totalCodes} icon={FiTrendingUp} />
        <SummaryTile label="Total RVUs" value={totals.totalRVU} icon={FiActivity} />
        <SummaryTile label="Estimated Revenue" value={`$${totals.revenue}`} icon={FiDollarSign} />
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <div className="card p-5">
          <div className="font-semibold flex items-center gap-2 mb-1">Comprehend Medical Entities</div>
          <p className="text-sm text-ink-600 mb-4">Full Comprehend Medical response stored in DynamoDB</p>
          {hasIcdEntities ? (
            <div className="space-y-4">
              {comprehendEntities.map((entity, idx) => (
                <EntityCard key={entity.id || idx} entity={entity} index={idx} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">
              No ICD entities were returned for this document.
            </div>
          )}
        </div>
      </div>

      {unmappedAttributes.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold mb-1">Unmapped Attributes</div>
          <p className="text-sm text-ink-600 mb-4">
            Attributes Comprehend Medical detected but could not associate with an ICD concept.
          </p>
          <div className="space-y-3">
            {unmappedAttributes.map(item => (
              <div key={item.id} className="rounded-lg border border-dashed border-ink-200 bg-ink-50/60 p-3">
                <div className="font-medium text-ink-700">{item.text || 'Attribute'}</div>
                <div className="text-xs text-ink-500">
                  {[item.type, item.category].filter(Boolean).join(' - ') || '—'}
                </div>
                <div className="text-xs text-ink-500 mt-1">Score: {formatScore(item.score)}</div>
                {item.traits.length > 0 && (
                  <div className="text-xs text-ink-500 mt-2">
                    Traits:{' '}
                    {item.traits
                      .map(trait => `${trait.name} (${formatScore(trait.score)})`)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="font-semibold mb-1">Clinical Notes &amp; Comments</div>
        <div className="text-sm text-ink-600 mb-3">Additional notes and observations for this coding session</div>
        <textarea
          className="input min-h-28"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add reviewer notes"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-outline" onClick={() => save(false)}>
          Save as Draft
        </button>
        <button
          className="btn btn-primary"
          onClick={() => save(true)}
          disabled={!hasIcdEntities}
        >
          Save & Confirm Coding
        </button>
      </div>
    </div>
  )
}

function EntityCard({ entity, index }) {
  const heading = entity.text || entity.normalizedValue || `Entity ${index + 1}`
  const metadata = [entity.category, entity.type].filter(Boolean).join(' - ')
  const showMore =
    entity.traits.length > 0 ||
    entity.attributes.length > 0 ||
    entity.relationships.length > 0 ||
    !!entity.normalizedValue

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-ink-800">{heading}</div>
          {metadata && <div className="text-xs text-ink-500 uppercase tracking-wide">{metadata}</div>}
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-500 uppercase tracking-wide">Score</div>
          <div className="text-sm font-semibold text-ink-700">{formatScore(entity.score)}</div>
        </div>
      </div>

      {entity.icdConcepts.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-ink-700 mb-2">Top inferred concepts</div>
          <div className="space-y-2">
            {entity.icdConcepts.map((concept, idx) => (
              <div
                key={concept.id || idx}
                className="rounded-lg border border-ink-100 bg-ink-50/60 p-3 space-y-1"
              >
                <div className="font-medium text-primary-700">{concept.code || 'N/A'}</div>
                {concept.description && <div className="text-sm text-ink-700">{concept.description}</div>}
                <div className="text-xs text-ink-500">Score: {formatScore(concept.score)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMore && (
        <details className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
          <summary className="cursor-pointer text-sm font-medium text-primary-700">More information</summary>
          <div className="mt-2 space-y-3 text-sm text-ink-700">
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-600">
              <div>
                <span className="font-medium text-ink-700">Score:</span> {formatScore(entity.score)}
              </div>
              {entity.type && (
                <div>
                  <span className="font-medium text-ink-700">Type:</span> {entity.type}
                </div>
              )}
              {entity.category && (
                <div>
                  <span className="font-medium text-ink-700">Category:</span> {entity.category}
                </div>
              )}
              {entity.normalizedValue && (
                <div className="col-span-2">
                  <span className="font-medium text-ink-700">Normalized value:</span> {entity.normalizedValue}
                </div>
              )}
            </div>

            {entity.traits.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-500">Traits</div>
                <ul className="mt-1 space-y-1">
                  {entity.traits.map(trait => (
                    <li key={trait.id}>
                      {trait.name}{' '}
                      <span className="text-ink-500">({formatScore(trait.score)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entity.attributes.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-500">Attributes</div>
                <ul className="mt-1 space-y-1">
                  {entity.attributes.map(attr => (
                    <li key={attr.id}>
                      <span className="font-medium">{attr.text || '—'}</span>
                      {attr.type && <span className="text-ink-500"> ({attr.type})</span>}
                      {Number.isFinite(attr.score) && (
                        <span className="text-ink-500"> — {formatScore(attr.score)}</span>
                      )}
                      {Number.isFinite(attr.relationshipScore) && (
                        <span className="text-ink-500"> — Relationship {formatScore(attr.relationshipScore)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entity.relationships.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-500">Related entities</div>
                <ul className="mt-1 space-y-1">
                  {entity.relationships.map(rel => (
                    <li key={rel.id}>
                      <span className="font-medium">{rel.type || 'Related entity'}</span>
                      {rel.targets.length > 0 && (
                        <span className="text-ink-500"> — {rel.targets.join(', ')}</span>
                      )}
                      {Number.isFinite(rel.score) && (
                        <span className="text-ink-500"> ({formatScore(rel.score)})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

function buildInitialCodes(document) {
  const entities = parseComprehendEntities(document)
  const icd10 = entities
    .map(entity => {
      const topConcept = entity.icdConcepts[0]
      const topScore = safeNumber(topConcept?.score ?? entity.score)
      return {
        code: topConcept?.code || '',
        desc: topConcept?.description || entity.text || '',
        confidence: normalizeConfidence(topScore),
        tag: entity.category,
        type: entity.type,
        text: entity.text || '',
      }
    })
    .filter(row => row.code || row.desc || row.text)

  return { icd10, cpt: [] }
}

function parseComprehendEntities(document) {
  const result = document?.ComprehendMedicalResult
  if (!result || !Array.isArray(result.Entities)) {
    return []
  }

  const base = result.Entities.map((entity, index) => {
    const rawId = entity.Id ?? index
    const icdConcepts = Array.isArray(entity.ICD10CMConcepts)
      ? entity.ICD10CMConcepts.map((concept, conceptIndex) => ({
          id: concept.Code ? `${concept.Code}-${conceptIndex}` : `concept-${conceptIndex}`,
          code: concept.Code || '',
          description: concept.Description || '',
          score: safeNumber(concept.Score),
        }))
      : []
    const traits = Array.isArray(entity.Traits)
      ? entity.Traits.map((trait, traitIndex) => ({
          id: trait.Name ? `${trait.Name}-${traitIndex}` : `trait-${traitIndex}`,
          name: trait.Name || '',
          score: safeNumber(trait.Score),
        }))
      : []
    const attributes = Array.isArray(entity.Attributes)
      ? entity.Attributes.map((attr, attrIndex) => ({
          id: attr.Id ?? `attr-${attrIndex}`,
          text: attr.Text || '',
          type: attr.Type || '',
          score: safeNumber(attr.Score),
          relationshipScore: safeNumber(attr.RelationshipScore),
        }))
      : []
    const relationships = Array.isArray(entity.Relationships)
      ? entity.Relationships.map((rel, relIndex) => ({
          id: relIndex,
          type: rel.Type || '',
          ids: Array.isArray(rel.Ids) ? rel.Ids.map(id => String(id)) : [],
          score: safeNumber(rel.Score),
        }))
      : []

    return {
      id: String(rawId),
      rawId: String(rawId),
      text: entity.Text || '',
      category: entity.Category || '',
      type: entity.Type || '',
      score: safeNumber(entity.Score),
      normalizedValue: entity.NormalizedValue?.Value || '',
      icdConcepts,
      traits,
      attributes,
      relationships,
    }
  })

  const lookup = new Map(base.map(entity => [entity.rawId, entity]))

  return base.map(entity => ({
    ...entity,
    relationships: entity.relationships.map(rel => ({
      ...rel,
      targets: rel.ids.map(id => {
        const target = lookup.get(id)
        return target?.text || `Entity ${id}`
      }),
    })),
  }))
}

function parseUnmappedAttributes(document) {
  const result = document?.ComprehendMedicalResult
  if (!result || !Array.isArray(result.UnmappedAttributes)) {
    return []
  }

  return result.UnmappedAttributes.map((item, index) => {
    const attribute = item.Attribute || {}
    const traits = Array.isArray(attribute.Traits)
      ? attribute.Traits.map((trait, traitIndex) => ({
          id: trait.Name ? `${trait.Name}-${traitIndex}` : `trait-${traitIndex}`,
          name: trait.Name || '',
          score: safeNumber(trait.Score),
        }))
      : []

    return {
      id: attribute.Id ?? `unmapped-${index}`,
      text: attribute.Text || '',
      type: attribute.Type || item.Type || '',
      category: attribute.Category || '',
      score: safeNumber(attribute.Score ?? item.Score),
      traits,
    }
  })
}

function safeNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (value === null || value === undefined) {
    return 0
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (typeof value === 'object' && typeof value.toString === 'function') {
    const parsed = Number(value.toString())
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function formatScore(value) {
  const num = safeNumber(value)
  return num.toFixed(4)
}

function normalizeConfidence(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  if (value > 1) return Math.min(value / 100, 1)
  if (value >= 0 && value <= 1) return value
  return 0
}

function SummaryTile({ label, value, icon: Icon, children }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-ink-600">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center">
          {Icon && <Icon />}
        </div>
      </div>
      {children}
    </div>
  )
}

