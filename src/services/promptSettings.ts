interface AreaPromptSettings {
  systemPrompt: string;
  maxSuggestions: number;
  useDefaultFallback: boolean;
}

interface PromptSettings {
  [areaId: string]: AreaPromptSettings;
}

const DEFAULT_PROMPTS: PromptSettings = {
  "key-partners": {
    systemPrompt: "You are an expert business strategist helping identify key partners for a Business Model Canvas. Focus on strategic alliances, suppliers, and partnerships that reduce costs, minimize risks, or provide essential resources. Consider both digital and traditional business models. Provide 3-5 specific, actionable suggestions that are relevant to the business description.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "key-activities": {
    systemPrompt: "You are an expert business analyst helping identify key activities for a Business Model Canvas. Focus on the most critical activities needed to create value, deliver products/services, and maintain customer relationships. Consider production, problem-solving, and platform activities. Provide 3-5 specific, actionable suggestions that are essential for the business model.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "key-resources": {
    systemPrompt: "You are an expert business strategist helping identify key resources for a Business Model Canvas. Focus on physical, intellectual, human, and financial resources that are essential for the business model. Consider what resources are most critical and hardest to replicate. Provide 3-5 specific, actionable suggestions that represent vital assets.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "value-propositions": {
    systemPrompt: "You are an expert product manager helping define value propositions for a Business Model Canvas. Focus on the unique value delivered to customers, problems solved, and needs satisfied. Consider performance, customization, convenience, cost reduction, and risk mitigation. Provide 3-5 specific, compelling value propositions that differentiate the business.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "customer-relationships": {
    systemPrompt: "You are an expert customer experience strategist helping define customer relationships for a Business Model Canvas. Focus on how the business will acquire, retain, and grow customer relationships. Consider personal assistance, self-service, automated services, communities, and co-creation. Provide 3-5 specific relationship strategies.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "channels": {
    systemPrompt: "You are an expert marketing strategist helping identify distribution channels for a Business Model Canvas. Focus on how to reach customers, communicate value, and deliver products/services. Consider direct, indirect, online, and offline channels. Provide 3-5 specific channel strategies that maximize reach and efficiency.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "customer-segments": {
    systemPrompt: "You are an expert market researcher helping identify customer segments for a Business Model Canvas. Focus on distinct groups of people or organizations with common characteristics, needs, and behaviors. Consider demographics, psychographics, and behavioral patterns. Provide 3-5 specific, well-defined customer segments.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "cost-structure": {
    systemPrompt: "You are an expert financial analyst helping identify cost structures for a Business Model Canvas. Focus on the most important costs in the business model, including fixed costs, variable costs, and economies of scale/scope. Consider what drives costs and optimization opportunities. Provide 3-5 specific cost categories or strategies.",
    maxSuggestions: 4,
    useDefaultFallback: true
  },
  "revenue-streams": {
    systemPrompt: "You are an expert business development strategist helping identify revenue streams for a Business Model Canvas. Focus on how the business generates cash from each customer segment. Consider asset sales, usage fees, subscriptions, licensing, and advertising. Provide 3-5 specific revenue model suggestions with clear value exchange.",
    maxSuggestions: 4,
    useDefaultFallback: true
  }
};

const STORAGE_KEY = 'bmc-prompt-settings';

export class PromptSettingsService {
  private static instance: PromptSettingsService;
  private settings: PromptSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): PromptSettingsService {
    if (!PromptSettingsService.instance) {
      PromptSettingsService.instance = new PromptSettingsService();
    }
    return PromptSettingsService.instance;
  }

  private loadSettings(): PromptSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all areas have settings
        return { ...DEFAULT_PROMPTS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load prompt settings from localStorage:', error);
    }
    return { ...DEFAULT_PROMPTS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save prompt settings to localStorage:', error);
    }
  }

  public getAreaSettings(areaId: string): AreaPromptSettings {
    return this.settings[areaId] || DEFAULT_PROMPTS[areaId];
  }

  public updateAreaSettings(areaId: string, settings: Partial<AreaPromptSettings>): void {
    this.settings[areaId] = {
      ...this.getAreaSettings(areaId),
      ...settings
    };
    this.saveSettings();
  }

  public getAllSettings(): PromptSettings {
    return { ...this.settings };
  }

  public resetAreaToDefault(areaId: string): void {
    if (DEFAULT_PROMPTS[areaId]) {
      this.settings[areaId] = { ...DEFAULT_PROMPTS[areaId] };
      this.saveSettings();
    }
  }

  public resetAllToDefaults(): void {
    this.settings = { ...DEFAULT_PROMPTS };
    this.saveSettings();
  }

  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  public importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      // Validate the structure
      for (const [areaId, settings] of Object.entries(imported)) {
        if (typeof settings !== 'object' || settings === null || 
            !(settings as AreaPromptSettings).systemPrompt) {
          throw new Error(`Invalid settings format for area: ${areaId}`);
        }
      }
      this.settings = { ...DEFAULT_PROMPTS, ...imported };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}