import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"

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

// Helper function to count words in text
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

// Helper function to calculate readability (simplified Flesch-Kincaid)
function calculateReadability(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)

  if (sentences.length === 0 || words.length === 0) return 0

  const avgWordsPerSentence = words.length / sentences.length
  const longWords = words.filter((word) => word.length > 6).length
  const percentLongWords = (longWords / words.length) * 100

  // Lower score is more complex, higher score is more readable
  const readabilityScore = 206.835 - 1.015 * avgWordsPerSentence - 0.846 * percentLongWords

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, readabilityScore))
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const $ = cheerio.load(response.data)
    const text = $("body").text().toLowerCase()
    const html = response.data.toLowerCase()
    const plainText = $("body").text()

    // Initialize scoring
    const analysis: AnalysisResult = {
      url,
      totalScore: 0,
      maxScore: 100, // Updated max score with new criteria
      percentage: 0,
      criteria: {
        structure: { score: 0, max: 10, details: [] },
        author: { score: 0, max: 8, details: [] },
        metadata: { score: 0, max: 8, details: [] },
        keywords: { score: 0, max: 8, details: [] },
        tone: { score: 0, max: 6, details: [] },
        credibility: { score: 0, max: 15, details: [] },
        readability: { score: 0, max: 15, details: [] },
        freshness: { score: 0, max: 10, details: [] },
        comprehensiveness: { score: 0, max: 10, details: [] },
        citations: { score: 0, max: 10, details: [] },
      },
      recommendations: [],
      researchInsights: [
        "AI systems like ChatGPT prefer to cite content with clear authorship and expertise signals",
        "Content with factual statements, statistics, and research citations is more likely to be referenced",
        "Well-structured content with clear headings and organization is prioritized by AI systems",
        "Recent and up-to-date information is more likely to be cited than outdated content",
        "Content from domains with established authority receives preferential treatment in AI citations",
        "Educational and informational content is cited more frequently than promotional material",
        "Content with neutral, objective tone is preferred over opinionated or biased writing",
      ],
    }

    // 1. Structure Analysis (10 points)
    const headings = $("h1, h2, h3, h4, h5, h6").length
    const lists = $("ul, ol").length
    const paragraphs = $("p").length
    const tableOfContents = text.includes("table of contents") || text.includes("contents")

    if (headings >= 3) {
      analysis.criteria.structure.score += 3
      analysis.criteria.structure.details.push("✓ Good heading structure (3+ headings)")
    } else {
      analysis.criteria.structure.details.push("✗ Limited heading structure")
    }

    if (lists >= 2) {
      analysis.criteria.structure.score += 2
      analysis.criteria.structure.details.push("✓ Contains lists/bullet points")
    } else {
      analysis.criteria.structure.details.push("✗ No lists or bullet points found")
    }

    if (paragraphs >= 5) {
      analysis.criteria.structure.score += 2
      analysis.criteria.structure.details.push("✓ Well-structured paragraphs")
    } else {
      analysis.criteria.structure.details.push("✗ Limited paragraph structure")
    }

    if (tableOfContents) {
      analysis.criteria.structure.score += 2
      analysis.criteria.structure.details.push("✓ Table of contents present")
    } else {
      analysis.criteria.structure.details.push("✗ No table of contents")
    }

    if (response.data.length > 2000) {
      analysis.criteria.structure.score += 1
      analysis.criteria.structure.details.push("✓ Substantial content length")
    } else {
      analysis.criteria.structure.details.push("✗ Content appears too short")
    }

    // 2. Author Analysis (8 points)
    const authorSelectors = [
      "author",
      "byline",
      "writer",
      "by-author",
      "post-author",
      '[rel="author"]',
      ".author",
      "#author",
      '[class*="author"]',
    ]

    let authorFound = false
    for (const selector of authorSelectors) {
      if ($(selector).length > 0) {
        authorFound = true
        break
      }
    }

    const authorKeywords = ["written by", "author:", "by ", "published by"]
    const hasAuthorKeywords = authorKeywords.some((keyword) => text.includes(keyword))

    if (authorFound || hasAuthorKeywords) {
      analysis.criteria.author.score += 4
      analysis.criteria.author.details.push("✓ Author information present")
    } else {
      analysis.criteria.author.details.push("✗ No clear author attribution")
    }

    const bioKeywords = ["bio", "about the author", "profile", "credentials"]
    const hasBio = bioKeywords.some((keyword) => text.includes(keyword))

    if (hasBio) {
      analysis.criteria.author.score += 2
      analysis.criteria.author.details.push("✓ Author bio/credentials found")
    } else {
      analysis.criteria.author.details.push("✗ No author bio or credentials")
    }

    const expertiseKeywords = ["expert", "specialist", "phd", "professor", "researcher", "years of experience"]
    const hasExpertise = expertiseKeywords.some((keyword) => text.includes(keyword))

    if (hasExpertise) {
      analysis.criteria.author.score += 2
      analysis.criteria.author.details.push("✓ Expertise indicators found")
    } else {
      analysis.criteria.author.details.push("✗ No clear expertise indicators")
    }

    // 3. Metadata Analysis (8 points)
    const title = $("title").text()
    const description = $('meta[name="description"]').attr("content") || ""
    const publishDate =
      $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="date"]').attr("content") ||
      $("time").attr("datetime")

    if (title && title.length > 10) {
      analysis.criteria.metadata.score += 2
      analysis.criteria.metadata.details.push("✓ Descriptive title present")
    } else {
      analysis.criteria.metadata.details.push("✗ Missing or poor title")
    }

    if (description && description.length > 50) {
      analysis.criteria.metadata.score += 3
      analysis.criteria.metadata.details.push("✓ Good meta description")
    } else {
      analysis.criteria.metadata.details.push("✗ Missing or poor meta description")
    }

    if (publishDate) {
      analysis.criteria.metadata.score += 2
      analysis.criteria.metadata.details.push("✓ Publication date found")
    } else {
      analysis.criteria.metadata.details.push("✗ No publication date")
    }

    const hasSchema = html.includes("schema.org") || html.includes("application/ld+json")
    if (hasSchema) {
      analysis.criteria.metadata.score += 1
      analysis.criteria.metadata.details.push("✓ Structured data present")
    } else {
      analysis.criteria.metadata.details.push("✗ No structured data")
    }

    // 4. Keywords Analysis (8 points)
    const aiKeywords = [
      "artificial intelligence",
      "ai",
      "machine learning",
      "chatgpt",
      "gpt",
      "openai",
      "gemini",
      "claude",
      "llm",
      "large language model",
      "deep learning",
      "neural network",
      "automation",
      "algorithm",
    ]

    const techKeywords = [
      "technology",
      "software",
      "programming",
      "development",
      "coding",
      "data science",
      "analytics",
      "digital",
      "innovation",
      "tech",
    ]

    const aiKeywordCount = aiKeywords.filter((keyword) => text.includes(keyword)).length
    const techKeywordCount = techKeywords.filter((keyword) => text.includes(keyword)).length

    if (aiKeywordCount >= 3) {
      analysis.criteria.keywords.score += 4
      analysis.criteria.keywords.details.push("✓ Rich AI-related keywords")
    } else if (aiKeywordCount >= 1) {
      analysis.criteria.keywords.score += 2
      analysis.criteria.keywords.details.push("✓ Some AI-related keywords")
    } else {
      analysis.criteria.keywords.details.push("✗ No AI-related keywords")
    }

    if (techKeywordCount >= 3) {
      analysis.criteria.keywords.score += 2
      analysis.criteria.keywords.details.push("✓ Technology keywords present")
    } else {
      analysis.criteria.keywords.details.push("✗ Limited technology keywords")
    }

    const topicalKeywords = ["how to", "guide", "tutorial", "tips", "best practices", "explained"]
    const hasTopicalKeywords = topicalKeywords.some((keyword) => text.includes(keyword))

    if (hasTopicalKeywords) {
      analysis.criteria.keywords.score += 2
      analysis.criteria.keywords.details.push("✓ Educational/informational keywords")
    } else {
      analysis.criteria.keywords.details.push("✗ No educational keywords")
    }

    // 5. Tone Analysis (6 points)
    const salesyWords = [
      "buy now",
      "purchase",
      "sale",
      "discount",
      "limited time",
      "act now",
      "special offer",
      "deal",
      "price",
      "$",
      "order now",
      "subscribe now",
    ]

    const neutralWords = [
      "according to",
      "research shows",
      "studies indicate",
      "experts say",
      "analysis reveals",
      "data suggests",
      "findings show",
      "evidence",
    ]

    const salesyCount = salesyWords.filter((word) => text.includes(word)).length
    const neutralCount = neutralWords.filter((word) => text.includes(word)).length

    if (salesyCount <= 2) {
      analysis.criteria.tone.score += 3
      analysis.criteria.tone.details.push("✓ Non-promotional tone")
    } else {
      analysis.criteria.tone.details.push("✗ Overly promotional language")
    }

    if (neutralCount >= 2) {
      analysis.criteria.tone.score += 3
      analysis.criteria.tone.details.push("✓ Objective, research-based tone")
    } else {
      analysis.criteria.tone.details.push("✗ Limited objective language")
    }

    // 6. NEW: Credibility Analysis (15 points)
    // Check for citations and references
    const citationPatterns = [
      "according to",
      "cited in",
      "reference",
      "source",
      "study",
      "research",
      "published in",
      "journal",
    ]
    const citationCount = citationPatterns.filter((pattern) => text.includes(pattern)).length

    if (citationCount >= 3) {
      analysis.criteria.credibility.score += 4
      analysis.criteria.credibility.details.push("✓ Multiple references to external sources")
    } else if (citationCount >= 1) {
      analysis.criteria.credibility.score += 2
      analysis.criteria.credibility.details.push("✓ Some references to external sources")
    } else {
      analysis.criteria.credibility.details.push("✗ No references to external sources")
    }

    // Check for statistics and data
    const statsPatterns = ["%", "percent", "statistics", "data shows", "survey", "study found"]
    const statsCount = statsPatterns.filter((pattern) => text.includes(pattern)).length

    if (statsCount >= 3) {
      analysis.criteria.credibility.score += 4
      analysis.criteria.credibility.details.push("✓ Contains statistics and data")
    } else if (statsCount >= 1) {
      analysis.criteria.credibility.score += 2
      analysis.criteria.credibility.details.push("✓ Some statistics or data")
    } else {
      analysis.criteria.credibility.details.push("✗ No statistics or data")
    }

    // Check for academic/institutional signals
    const academicSignals = [
      "university",
      "institute",
      "research center",
      "laboratory",
      "academic",
      "study",
      "paper",
      "journal",
    ]
    const academicCount = academicSignals.filter((signal) => text.includes(signal)).length

    if (academicCount >= 2) {
      analysis.criteria.credibility.score += 4
      analysis.criteria.credibility.details.push("✓ Strong academic/institutional signals")
    } else if (academicCount >= 1) {
      analysis.criteria.credibility.score += 2
      analysis.criteria.credibility.details.push("✓ Some academic/institutional signals")
    } else {
      analysis.criteria.credibility.details.push("✗ No academic/institutional signals")
    }

    // Check for fact-checking signals
    const factCheckingSignals = ["fact", "verified", "evidence-based", "proven", "confirmed"]
    const factCheckCount = factCheckingSignals.filter((signal) => text.includes(signal)).length

    if (factCheckCount >= 2) {
      analysis.criteria.credibility.score += 3
      analysis.criteria.credibility.details.push("✓ Contains fact-checking signals")
    } else {
      analysis.criteria.credibility.details.push("✗ No fact-checking signals")
    }

    // 7. NEW: Readability Analysis (15 points)
    const readabilityScore = calculateReadability(plainText)
    const wordCount = countWords(plainText)
    const sentenceCount = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const avgSentenceLength = wordCount / sentenceCount

    // Ideal readability score is between 60-70 (roughly 8th-9th grade level)
    if (readabilityScore >= 60 && readabilityScore <= 70) {
      analysis.criteria.readability.score += 6
      analysis.criteria.readability.details.push("✓ Optimal readability level (8th-9th grade)")
    } else if (readabilityScore >= 50 && readabilityScore < 60) {
      analysis.criteria.readability.score += 4
      analysis.criteria.readability.details.push("✓ Good readability level (10th-12th grade)")
    } else if (readabilityScore > 70) {
      analysis.criteria.readability.score += 3
      analysis.criteria.readability.details.push("✓ Very simple readability (may lack depth)")
    } else {
      analysis.criteria.readability.score += 1
      analysis.criteria.readability.details.push("✗ Complex readability (college level or higher)")
    }

    // Check sentence length
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
      analysis.criteria.readability.score += 3
      analysis.criteria.readability.details.push("✓ Optimal average sentence length")
    } else if (avgSentenceLength < 10) {
      analysis.criteria.readability.score += 1
      analysis.criteria.readability.details.push("✗ Sentences may be too short")
    } else {
      analysis.criteria.readability.score += 1
      analysis.criteria.readability.details.push("✗ Sentences may be too long")
    }

    // Check for transition words
    const transitionWords = [
      "however",
      "therefore",
      "furthermore",
      "moreover",
      "consequently",
      "additionally",
      "in addition",
      "for example",
      "for instance",
      "in conclusion",
    ]
    const transitionCount = transitionWords.filter((word) => text.includes(word)).length

    if (transitionCount >= 3) {
      analysis.criteria.readability.score += 3
      analysis.criteria.readability.details.push("✓ Good use of transition words")
    } else if (transitionCount >= 1) {
      analysis.criteria.readability.score += 1
      analysis.criteria.readability.details.push("✓ Some transition words present")
    } else {
      analysis.criteria.readability.details.push("✗ No transition words found")
    }

    // Check for active voice
    const passiveVoicePatterns = [" is ", " are ", " was ", " were ", " be ", " been ", " by "].filter((pattern) =>
      text.includes(pattern),
    ).length
    const activeVoiceRatio = 1 - passiveVoicePatterns / (wordCount / 10) // Rough estimation

    if (activeVoiceRatio > 0.7) {
      analysis.criteria.readability.score += 3
      analysis.criteria.readability.details.push("✓ Primarily active voice")
    } else if (activeVoiceRatio > 0.5) {
      analysis.criteria.readability.score += 2
      analysis.criteria.readability.details.push("✓ Mix of active and passive voice")
    } else {
      analysis.criteria.readability.details.push("✗ Excessive passive voice")
    }

    // 8. NEW: Freshness Analysis (10 points)
    let dateScore = 0
    let dateFound = false

    // Try to extract date from meta tags or content
    if (publishDate) {
      dateFound = true
      const pubDate = new Date(publishDate)
      const now = new Date()
      const monthsAgo = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

      if (monthsAgo <= 1) {
        dateScore = 10 // Published within last month
      } else if (monthsAgo <= 3) {
        dateScore = 8 // Published within last 3 months
      } else if (monthsAgo <= 6) {
        dateScore = 6 // Published within last 6 months
      } else if (monthsAgo <= 12) {
        dateScore = 4 // Published within last year
      } else if (monthsAgo <= 24) {
        dateScore = 2 // Published within last 2 years
      } else {
        dateScore = 0 // Older than 2 years
      }
    }

    // Look for date indicators in text if no meta date found
    if (!dateFound) {
      const currentYear = new Date().getFullYear()
      const lastYear = currentYear - 1

      if (text.includes(currentYear.toString())) {
        dateScore = 6
        dateFound = true
      } else if (text.includes(lastYear.toString())) {
        dateScore = 4
        dateFound = true
      }
    }

    // Check for recency signals in content
    const recencySignals = ["recent", "latest", "new", "update", "current", "today", "this month", "this year"]
    const recencyCount = recencySignals.filter((signal) => text.includes(signal)).length

    if (recencyCount >= 2) {
      dateScore = Math.min(10, dateScore + 2)
      analysis.criteria.freshness.details.push("✓ Contains recency signals")
    }

    analysis.criteria.freshness.score = dateScore

    if (dateFound) {
      if (dateScore >= 8) {
        analysis.criteria.freshness.details.push("✓ Very recent content (within 3 months)")
      } else if (dateScore >= 4) {
        analysis.criteria.freshness.details.push("✓ Relatively recent content (within a year)")
      } else {
        analysis.criteria.freshness.details.push("✗ Content may be outdated")
      }
    } else {
      analysis.criteria.freshness.details.push("✗ No clear publication date found")
    }

    // 9. NEW: Comprehensiveness Analysis (10 points)
    // Word count assessment
    if (wordCount >= 1500) {
      analysis.criteria.comprehensiveness.score += 4
      analysis.criteria.comprehensiveness.details.push("✓ In-depth content (1500+ words)")
    } else if (wordCount >= 800) {
      analysis.criteria.comprehensiveness.score += 3
      analysis.criteria.comprehensiveness.details.push("✓ Substantial content (800+ words)")
    } else if (wordCount >= 400) {
      analysis.criteria.comprehensiveness.score += 2
      analysis.criteria.comprehensiveness.details.push("✓ Moderate content length (400+ words)")
    } else {
      analysis.criteria.comprehensiveness.details.push("✗ Content may be too brief")
    }

    // Check for comprehensive coverage signals
    const comprehensiveSignals = [
      "complete",
      "comprehensive",
      "in-depth",
      "detailed",
      "thorough",
      "ultimate guide",
      "everything you need to know",
    ]
    const comprehensiveCount = comprehensiveSignals.filter((signal) => text.includes(signal)).length

    if (comprehensiveCount >= 1) {
      analysis.criteria.comprehensiveness.score += 2
      analysis.criteria.comprehensiveness.details.push("✓ Claims to be comprehensive")
    }

    // Check for multiple perspectives
    const perspectiveSignals = [
      "on the other hand",
      "alternatively",
      "however",
      "in contrast",
      "different perspective",
      "another view",
      "pros and cons",
      "advantages and disadvantages",
    ]
    const perspectiveCount = perspectiveSignals.filter((signal) => text.includes(signal)).length

    if (perspectiveCount >= 2) {
      analysis.criteria.comprehensiveness.score += 2
      analysis.criteria.comprehensiveness.details.push("✓ Presents multiple perspectives")
    } else {
      analysis.criteria.comprehensiveness.details.push("✗ May present limited perspective")
    }

    // Check for examples and case studies
    const exampleSignals = ["example", "case study", "instance", "for instance", "such as", "e.g."]
    const exampleCount = exampleSignals.filter((signal) => text.includes(signal)).length

    if (exampleCount >= 2) {
      analysis.criteria.comprehensiveness.score += 2
      analysis.criteria.comprehensiveness.details.push("✓ Includes examples or case studies")
    } else {
      analysis.criteria.comprehensiveness.details.push("✗ Limited examples or illustrations")
    }

    // 10. NEW: Citations Analysis (10 points)
    // Check for links to external sources
    const externalLinks = $("a[href^='http']").filter(function () {
      const href = $(this).attr("href") || ""
      return !href.includes(url)
    }).length

    if (externalLinks >= 5) {
      analysis.criteria.citations.score += 4
      analysis.criteria.citations.details.push("✓ Multiple external links (5+)")
    } else if (externalLinks >= 2) {
      analysis.criteria.citations.score += 2
      analysis.criteria.citations.details.push("✓ Some external links")
    } else {
      analysis.criteria.citations.details.push("✗ Few or no external links")
    }

    // Check for formal citations
    const formalCitationPatterns = [
      "et al",
      "cited in",
      "reference",
      "bibliography",
      "works cited",
      "references",
      "citation",
    ]
    const formalCitationCount = formalCitationPatterns.filter((pattern) => text.includes(pattern)).length

    if (formalCitationCount >= 2) {
      analysis.criteria.citations.score += 3
      analysis.criteria.citations.details.push("✓ Formal citations present")
    } else {
      analysis.criteria.citations.details.push("✗ No formal citations")
    }

    // Check for quotes
    const quoteCount = (text.match(/"/g) || []).length / 2 // Rough estimation of quote pairs

    if (quoteCount >= 3) {
      analysis.criteria.citations.score += 3
      analysis.criteria.citations.details.push("✓ Multiple quoted sources")
    } else if (quoteCount >= 1) {
      analysis.criteria.citations.score += 1
      analysis.criteria.citations.details.push("✓ Some quoted content")
    } else {
      analysis.criteria.citations.details.push("✗ No quoted sources")
    }

    // Calculate total score
    analysis.totalScore = Object.values(analysis.criteria).reduce((sum, criteria) => sum + criteria.score, 0)
    analysis.percentage = (analysis.totalScore / analysis.maxScore) * 100

    // Generate recommendations
    if (analysis.criteria.structure.score < 7) {
      analysis.recommendations.push("Add more headings, lists, and a table of contents to improve content structure")
    }
    if (analysis.criteria.author.score < 5) {
      analysis.recommendations.push("Include clear author attribution, credentials, and expertise signals")
    }
    if (analysis.criteria.metadata.score < 5) {
      analysis.recommendations.push("Improve meta description, add publication date, and implement schema markup")
    }
    if (analysis.criteria.keywords.score < 5) {
      analysis.recommendations.push("Include more relevant AI and technology keywords")
    }
    if (analysis.criteria.tone.score < 4) {
      analysis.recommendations.push("Use more neutral, research-based language and reduce promotional content")
    }
    if (analysis.criteria.credibility.score < 8) {
      analysis.recommendations.push("Add references to research, statistics, and academic sources to boost credibility")
    }
    if (analysis.criteria.readability.score < 8) {
      analysis.recommendations.push(
        "Improve readability by using shorter sentences, active voice, and transition words",
      )
    }
    if (analysis.criteria.freshness.score < 5) {
      analysis.recommendations.push("Update content with current information and clearly display publication date")
    }
    if (analysis.criteria.comprehensiveness.score < 5) {
      analysis.recommendations.push(
        "Expand content depth with more examples, multiple perspectives, and detailed coverage",
      )
    }
    if (analysis.criteria.citations.score < 5) {
      analysis.recommendations.push("Add more external links, formal citations, and quoted sources")
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze the webpage. Please check the URL and try again." },
      { status: 500 },
    )
  }
}
