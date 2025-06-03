import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, Award, Link2, Clock, Target } from "lucide-react"

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Citation Research</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our research on how AI systems like ChatGPT and Gemini select content to cite
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                How AI Systems Select Content to Cite
              </CardTitle>
              <CardDescription>Research findings on AI citation patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Modern AI systems like ChatGPT, Claude, and Gemini use sophisticated algorithms to determine which
                content to cite when responding to user queries. Our research has identified several key factors that
                influence these citation decisions:
              </p>

              <div className="grid gap-6 mt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Authority and Credibility</h3>
                    <p className="text-gray-600">
                      AI systems prioritize content from authoritative sources with clear expertise signals. Content
                      with author credentials, institutional affiliations, and references to research is more likely to
                      be cited. This includes academic papers, content from recognized experts, and material from
                      established institutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Content Quality and Structure</h3>
                    <p className="text-gray-600">
                      Well-structured content with clear headings, logical organization, and appropriate depth is
                      preferred. AI systems favor content that is comprehensive, factual, and educational rather than
                      promotional. Content with optimal readability (typically 8th-9th grade level) is more likely to be
                      cited as it balances accessibility with informational depth.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Citations and References</h3>
                    <p className="text-gray-600">
                      Content that itself cites reliable sources is more likely to be referenced by AI systems. This
                      creates a "citation network effect" where well-referenced content gains more visibility. External
                      links, formal citations, and quotes from authoritative sources all increase the likelihood of AI
                      citation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Freshness and Relevance</h3>
                    <p className="text-gray-600">
                      Recent content is generally preferred, especially for rapidly evolving topics. AI systems evaluate
                      content freshness through publication dates, content updates, and temporal references within the
                      text. For evergreen topics, comprehensive older content may still be cited if it remains accurate
                      and relevant.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Objectivity and Tone</h3>
                    <p className="text-gray-600">
                      AI systems favor content with a neutral, objective tone that presents information without
                      excessive bias. Educational content that uses evidence-based language and presents multiple
                      perspectives is more likely to be cited. Content with overtly promotional language or strong
                      opinion-based assertions is less likely to be referenced.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Research Methodology</h3>
                <p className="text-gray-600">
                  Our findings are based on analysis of citation patterns across major AI systems, reverse engineering
                  of citation algorithms, and interviews with AI researchers. We continuously update our criteria based
                  on observed changes in AI citation behavior.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>AI Visibility Checker - Research Insights</p>
        </div>
      </div>
    </div>
  )
}
