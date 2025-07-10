interface GeneratePostItsRequest {
  businessDescription: string;
  areaId: string;
  llmModel: string;
}

interface PostItSuggestion {
  text: string;
  color: "yellow" | "blue" | "green" | "pink" | "orange" | "purple";
}

const BMC_AREA_DESCRIPTIONS = {
  "key-partners": "Key Partners: Who are the key partners and suppliers that will help your business work?",
  "key-activities": "Key Activities: What are the most important things your company must do to make the business model work?",
  "key-resources": "Key Resources: What are the most important assets required to make the business model work?",
  "value-propositions": "Value Propositions: What value do you deliver to customers? Which customer problems are you solving?",
  "customer-relationships": "Customer Relationships: What type of relationship does each customer segment expect you to establish?",
  "channels": "Channels: Through which channels do your customer segments want to be reached?",
  "customer-segments": "Customer Segments: For whom are you creating value? Who are your most important customers?",
  "cost-structure": "Cost Structure: What are the most important costs inherent in your business model?",
  "revenue-streams": "Revenue Streams: For what value are your customers really willing to pay?"
};

export async function generatePostIts({ businessDescription, areaId, llmModel }: GeneratePostItsRequest): Promise<PostItSuggestion[]> {
  const areaDescription = BMC_AREA_DESCRIPTIONS[areaId as keyof typeof BMC_AREA_DESCRIPTIONS];
  
  // For now, return example suggestions since API key integration is not set up
  // In a production environment, you would connect this to Supabase Edge Functions
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return contextual suggestions based on the area
  const suggestions = getAreaSuggestions(areaId, businessDescription);
  
  const colors: PostItSuggestion["color"][] = ["yellow", "blue", "green", "pink", "orange", "purple"];
  
  return suggestions.map((text) => ({
    text,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
}

function getAreaSuggestions(areaId: string, businessDescription: string): string[] {
  const isDigitalBusiness = businessDescription.toLowerCase().includes('app') || 
                           businessDescription.toLowerCase().includes('digital') ||
                           businessDescription.toLowerCase().includes('online') ||
                           businessDescription.toLowerCase().includes('platform');
  
  const suggestions: Record<string, string[]> = {
    "key-partners": isDigitalBusiness 
      ? ["Technology providers", "Payment processors", "App stores", "Cloud services"]
      : ["Suppliers", "Distributors", "Key vendors", "Strategic alliances"],
    
    "key-activities": isDigitalBusiness
      ? ["Software development", "User acquisition", "Platform maintenance", "Data analytics"]
      : ["Production", "Marketing", "Sales", "Customer service"],
    
    "key-resources": isDigitalBusiness
      ? ["Development team", "Server infrastructure", "User data", "Intellectual property"]
      : ["Physical assets", "Human resources", "Brand", "Financial resources"],
    
    "value-propositions": isDigitalBusiness
      ? ["Convenience", "Real-time access", "Personalization", "Automation"]
      : ["Quality products", "Competitive pricing", "Reliability", "Customer service"],
    
    "customer-relationships": isDigitalBusiness
      ? ["Self-service", "Automated support", "Community", "Personal assistance"]
      : ["Personal assistance", "Self-service", "Automated services", "Communities"],
    
    "channels": isDigitalBusiness
      ? ["Mobile app", "Website", "Social media", "Email marketing"]
      : ["Direct sales", "Retail stores", "Online channels", "Partner channels"],
    
    "customer-segments": isDigitalBusiness
      ? ["Early adopters", "Tech-savvy users", "Mobile-first users", "Digital natives"]
      : ["Mass market", "Niche market", "Segmented", "Diversified"],
    
    "cost-structure": isDigitalBusiness
      ? ["Development costs", "Server hosting", "Marketing", "Customer acquisition"]
      : ["Fixed costs", "Variable costs", "Economies of scale", "Economies of scope"],
    
    "revenue-streams": isDigitalBusiness
      ? ["Subscription fees", "Transaction fees", "Advertising", "Freemium model"]
      : ["Asset sales", "Usage fees", "Subscription fees", "Licensing"]
  };
  
  return suggestions[areaId] || ["Custom suggestion 1", "Custom suggestion 2", "Custom suggestion 3"];
}