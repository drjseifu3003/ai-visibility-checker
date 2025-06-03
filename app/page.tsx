"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Target,
  FileText,
  User,
  Calendar,
  Hash,
  Link2,
  BookOpen,
  Award,
  Clock,
  Check,
  Info,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CriteriaScore {
  score: number
  max: number
  details: string[]
}

interface AnalysisResult {
  url: string
  totalScore: number
  maxScore: number
  percentage: number
  criteria: {
    structure: CriteriaScore
    author: CriteriaScore
    metadata: CriteriaScore
    keywords: CriteriaScore
    tone: CriteriaScore
    credibility: CriteriaScore
    readability: CriteriaScore
    freshness: CriteriaScore
    comprehensiveness: CriteriaScore
    citations: CriteriaScore
  }
  recommendations: string[]
  researchInsights: string[]
}

export default function AIVisibilityChecker() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const analyzeUrl = async () => {
    if (!url) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze URL")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to analyze the URL. Please check the URL and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  const criteriaIcons = {
    structure: FileText,
    author: User,
    metadata: Calendar,
    keywords: Hash,
    tone: Target,
    credibility: Award,
    readability: BookOpen,
    freshness: Clock,
    comprehensiveness: Info,
    citations: Link2,
  }

  const criteriaDescriptions = {
    structure: "How well-organized the content is with headings, lists, and clear sections",
    author: "Presence of author information, credentials, and expertise signals",
    metadata: "Quality of title, description, publication date, and structured data",
    keywords: "Presence of relevant AI and technology terminology",
    tone: "Objectivity and educational nature of the content",
    credibility: "Signals that indicate trustworthiness and authority",
    readability: "How easy the content is to read and understand",
    freshness: "How recent and up-to-date the content appears to be",
    comprehensiveness: "Depth and breadth of information provided",
    citations: "References to external sources and research",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Visibility Checker</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze any webpage to see how likely it is to be cited by AI tools like ChatGPT or Gemini. Get actionable
            insights to optimize your content for AI visibility.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter URL to Analyze</CardTitle>
            <CardDescription>Paste any webpage URL to get an AI citation probability score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && analyzeUrl()}
                className="flex-1"
              />
              <Button onClick={analyzeUrl} disabled={loading || !url}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI Citation Probability Score
                </CardTitle>
                <CardDescription>Based on analysis of {result.url}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold">
                    <span className={getScoreColor(result.percentage)}>{result.totalScore}</span>
                    <span className="text-2xl text-gray-500">/{result.maxScore}</span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(result.percentage)} className="text-lg px-3 py-1">
                    {result.percentage.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={result.percentage} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  {result.percentage >= 80 && "Excellent! This content is highly likely to be cited by AI tools."}
                  {result.percentage >= 60 && result.percentage < 80 && "Good potential with room for improvement."}
                  {result.percentage < 60 && "Needs optimization to improve AI citation likelihood."}
                </p>
              </CardContent>
            </Card>

            {/* Research Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Citation Research Insights
                </CardTitle>
                <CardDescription>Based on research of how AI systems select content to cite</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.researchInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-indigo-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Criteria Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>Breakdown of factors that influence AI citation probability</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="all">All Criteria</TabsTrigger>
                    <TabsTrigger value="categories">By Category</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <div className="grid gap-4">
                      {Object.entries(result.criteria).map(([key, data]) => {
                        const Icon = criteriaIcons[key as keyof typeof criteriaIcons]
                        const percentage = (data.score / data.max) * 100
                        const description = criteriaDescriptions[key as keyof typeof criteriaDescriptions]

                        return (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span className="font-medium capitalize">{key}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {data.score}/{data.max}
                                </span>
                                <Badge variant={getScoreBadgeVariant(percentage)} size="sm">
                                  {percentage.toFixed(0)}%
                                </Badge>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2 mb-2" />
                            <div className="space-y-1">
                              {data.details.map((detail, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  {detail.startsWith("✓") ? (
                                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span className="text-gray-600">{detail.substring(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="categories">
                    <div className="grid gap-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-3">Content Quality</h3>
                        <div className="grid gap-3">
                          {["structure", "comprehensiveness", "readability"].map((key) => {
                            const data = result.criteria[key as keyof typeof result.criteria]
                            const Icon = criteriaIcons[key as keyof typeof criteriaIcons]
                            const percentage = (data.score / data.max) * 100
                            return (
                              <div key={key} className="border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium capitalize">{key}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {data.score}/{data.max}
                                    </span>
                                    <Badge variant={getScoreBadgeVariant(percentage)} size="sm">
                                      {percentage.toFixed(0)}%
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-3">Authority Signals</h3>
                        <div className="grid gap-3">
                          {["author", "credibility", "citations"].map((key) => {
                            const data = result.criteria[key as keyof typeof result.criteria]
                            const Icon = criteriaIcons[key as keyof typeof criteriaIcons]
                            const percentage = (data.score / data.max) * 100
                            return (
                              <div key={key} className="border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium capitalize">{key}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {data.score}/{data.max}
                                    </span>
                                    <Badge variant={getScoreBadgeVariant(percentage)} size="sm">
                                      {percentage.toFixed(0)}%
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-3">Technical Optimization</h3>
                        <div className="grid gap-3">
                          {["metadata", "keywords", "tone", "freshness"].map((key) => {
                            const data = result.criteria[key as keyof typeof result.criteria]
                            const Icon = criteriaIcons[key as keyof typeof criteriaIcons]
                            const percentage = (data.score / data.max) * 100
                            return (
                              <div key={key} className="border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium capitalize">{key}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {data.score}/{data.max}
                                    </span>
                                    <Badge variant={getScoreBadgeVariant(percentage)} size="sm">
                                      {percentage.toFixed(0)}%
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>Actions to improve your AI citation probability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>AI Visibility Checker - Prototype for Customer Validation</p>
        </div>
      </div>
    </div>
  )
}
