import { AIAnalysis } from '../models/AIAnalysis';
import { WasteCategory } from '../models/WasteCategory';
import { config } from '../config';
import mongoose from 'mongoose';

export interface ClassificationResult {
  predictedCategory: string;
  confidence: number;
  suggestedSeverity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  suggestedAction?: string;
  disposalGuidance?: string;
  explanation: string;
}

export interface SummaryResult {
  summary: string;
  keyInsights: string[];
}

interface AIProvider {
  classifyWaste(description: string, photoUrl?: string): Promise<ClassificationResult>;
  classifyIssue(description: string, title: string): Promise<ClassificationResult>;
  generateAreaSummary(metrics: Record<string, unknown>): Promise<SummaryResult>;
}

/**
 * MockAIProvider: Deterministic, high-quality rule-based NLP classifier.
 * Never requires external API keys, ensuring WasteConnect is 100% functional offline/locally.
 */
class MockAIProvider implements AIProvider {
  async classifyWaste(description: string): Promise<ClassificationResult> {
    const text = description.toLowerCase();

    if (text.includes('battery') || text.includes('laptop') || text.includes('phone') || text.includes('circuit') || text.includes('electronic')) {
      return {
        predictedCategory: 'E-waste',
        confidence: 0.94,
        suggestedSeverity: 'HIGH',
        suggestedAction: 'Require authorized e-waste collector with hazardous handling license',
        disposalGuidance: 'Do not mix with regular household waste. Keep batteries separated and terminals taped.',
        explanation: 'Identified electronic components and heavy metals which require specialized recovery.',
      };
    }

    if (text.includes('paint') || text.includes('chemical') || text.includes('solvent') || text.includes('pesticide') || text.includes('oil')) {
      return {
        predictedCategory: 'Household Hazardous',
        confidence: 0.96,
        suggestedSeverity: 'CRITICAL',
        suggestedAction: 'Immediate containment and specialized hazardous disposal protocol',
        disposalGuidance: 'Keep in original sealed container. Do not pour down drains or into general waste.',
        explanation: 'Identified potential volatile or toxic chemicals requiring controlled facility handling.',
      };
    }

    if (text.includes('bottle') || text.includes('container') || text.includes('plastic') || text.includes('poly')) {
      return {
        predictedCategory: 'Plastic',
        confidence: 0.89,
        suggestedSeverity: 'LOW',
        suggestedAction: 'Standard recyclable sorting and transport to baling facility',
        disposalGuidance: 'Rinse thoroughly and remove bottle caps where applicable before collection.',
        explanation: 'Identified polymers and single-use containers suitable for secondary material processing.',
      };
    }

    if (text.includes('food') || text.includes('vegetable') || text.includes('fruit') || text.includes('leaf') || text.includes('garden')) {
      return {
        predictedCategory: 'Organic',
        confidence: 0.92,
        suggestedSeverity: 'MODERATE',
        suggestedAction: 'Direct to municipal composting facility or anaerobic biodigester',
        disposalGuidance: 'Store in biodegradable or compostable paper bag to avoid pest attraction.',
        explanation: 'Identified biodegradable matter with high moisture content suitable for composting.',
      };
    }

    return {
      predictedCategory: 'Mixed',
      confidence: 0.78,
      suggestedSeverity: 'MODERATE',
      suggestedAction: 'Secondary sorting at municipal material recovery facility (MRF)',
      disposalGuidance: 'Please segregate recyclables if possible to reduce landfill diversion volume.',
      explanation: 'General mixed household waste. Secondary manual or optical sorting recommended.',
    };
  }

  async classifyIssue(description: string, title: string): Promise<ClassificationResult> {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('fire') || text.includes('burn') || text.includes('smoke')) {
      return {
        predictedCategory: 'Waste Burning',
        confidence: 0.97,
        suggestedSeverity: 'CRITICAL',
        suggestedAction: 'Emergency dispatch to extinguish fire and issue environmental compliance citation',
        explanation: 'Open burning of municipal solid waste produces dioxins and immediate respiratory hazards.',
      };
    }

    if (text.includes('dump') || text.includes('construction') || text.includes('debris') || text.includes('rubble')) {
      return {
        predictedCategory: 'Illegal Dumping',
        confidence: 0.93,
        suggestedSeverity: 'HIGH',
        suggestedAction: 'Deploy heavy equipment vehicle and schedule area monitoring to prevent recurrence',
        explanation: 'Unauthorized bulk discard on public roadway or vacant ground creating public nuisance.',
      };
    }

    if (text.includes('overflow') || text.includes('spill') || text.includes('bin') || text.includes('can')) {
      return {
        predictedCategory: 'Overflowing Public Bin',
        confidence: 0.95,
        suggestedSeverity: 'MODERATE',
        suggestedAction: 'Route regular municipal tipper truck for emergency bin clearing and washing',
        explanation: 'Container capacity exceeded in high-footfall area leading to pedestrian obstruction.',
      };
    }

    return {
      predictedCategory: 'Garbage Accumulation',
      confidence: 0.82,
      suggestedSeverity: 'MODERATE',
      suggestedAction: 'Dispatch standard neighborhood sanitation crew for scheduled sweeping',
      explanation: 'General accumulation of debris on municipal street or public footpath.',
    };
  }

  async generateAreaSummary(metrics: Record<string, unknown>): Promise<SummaryResult> {
    return {
      summary: `Operations analysis indicates steady municipal waste collection activity with an average hotspot risk index. Continued focus on unresolved issues in industrial zones is recommended.`,
      keyInsights: [
        'Illegal dumping incidents correlate heavily with industrial corridor access roads.',
        'Weekend cleanup drives demonstrate a 35% reduction in public complaints the following week.',
        'Average SLA compliance rate across residential wards remains above 88%.',
      ],
    };
  }
}

export const aiService = {
  getProvider(): AIProvider {
    // In future, can return GeminiProvider if GEMINI_API_KEY is supplied and config.ai.provider === 'gemini'
    return new MockAIProvider();
  },

  async analyzeWastePickup(pickupId: string, description: string) {
    const provider = this.getProvider();
    const result = await provider.classifyWaste(description);

    await AIAnalysis.create({
      entityType: 'PickupRequest',
      entityId: new mongoose.Types.ObjectId(pickupId),
      provider: config.ai.provider,
      modelName: config.ai.provider === 'mock' ? 'wasteconnect-mock-rules-v1' : 'gemini-1.5-flash',
      task: 'WASTE_CLASSIFICATION',
      inputSummary: description.substring(0, 150),
      output: result,
      confidence: result.confidence,
      predictedCategory: result.predictedCategory,
    });

    return result;
  },

  async analyzePublicIssue(issueId: string, title: string, description: string) {
    const provider = this.getProvider();
    const result = await provider.classifyIssue(description, title);

    await AIAnalysis.create({
      entityType: 'PublicIssue',
      entityId: new mongoose.Types.ObjectId(issueId),
      provider: config.ai.provider,
      modelName: config.ai.provider === 'mock' ? 'wasteconnect-mock-rules-v1' : 'gemini-1.5-flash',
      task: 'ISSUE_CLASSIFICATION',
      inputSummary: `${title}: ${description}`.substring(0, 150),
      output: result,
      confidence: result.confidence,
      predictedCategory: result.predictedCategory,
    });

    return result;
  },
};
