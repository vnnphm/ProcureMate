import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {createPurchaseRequest} from "@/lib/api";

export default function NewRequest() {
  const navigate = useNavigate()
  const [rawText, setRawText] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(){
    setIsSubmitting(true)
    setError(null)

    try {
      const createdRequest = await createPurchaseRequest({ raw_text: rawText })
      navigate(`/requests/${createdRequest.id}`)
    } catch {
      setError("Could not submit request. Please try again!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Purchase Request</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe what you need in plain English. AI will extract the details.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Describe Your Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. We need 30 laptops for new engineering hires starting next month. Budget is around $42,000. Need 16GB RAM, 512GB SSD, business warranty, and delivery before July 15."
            className="w-full h-40 p-3 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-2">
            {rawText.length} characters
          </p>
        </CardContent>
      </Card>
        {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">

        <Button
          onClick={handleSubmit}
          disabled={rawText.length < 10 || isSubmitting}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/requests")}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
