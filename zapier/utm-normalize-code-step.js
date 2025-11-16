// UTM Normalization Callable - Zapier Code Step
// Input: raw UTM parameters from trigger/previous step
// Output: normalized channel, subchannel, campaign_type

// ===== INPUT VARIABLES =====
const rawSource = (inputData.utm_source || '').toLowerCase().trim();
const rawMedium = (inputData.utm_medium || '').toLowerCase().trim();
const rawCampaign = (inputData.utm_campaign || '').toLowerCase().trim();

// ===== CHANNEL MAPPING RULES =====
const channelMap = {
  // Social Paid
  'facebook|fb|meta': { source: ['facebook', 'fb', 'meta'], medium: ['cpc', 'paid', 'paid-social'], channel: 'Social Paid', subchannel: 'Facebook' },
  'linkedin|li': { source: ['linkedin', 'li'], medium: ['cpc', 'paid', 'paid-social'], channel: 'Social Paid', subchannel: 'LinkedIn' },
  
  // Social Organic
  'facebook|fb|meta': { source: ['facebook', 'fb', 'meta'], medium: ['social', 'organic', 'post'], channel: 'Social Organic', subchannel: 'Facebook' },
  'linkedin|li': { source: ['linkedin', 'li'], medium: ['social', 'organic', 'post'], channel: 'Social Organic', subchannel: 'LinkedIn' },
  
  // Paid Search
  'google': { source: ['google'], medium: ['cpc', 'paid', 'ppc'], channel: 'Paid Search', subchannel: 'Google Ads' },
  'bing': { source: ['bing'], medium: ['cpc', 'paid', 'ppc'], channel: 'Paid Search', subchannel: 'Bing Ads' },
  
  // Email
  'email': { source: ['email', 'newsletter', 'marketo', 'iterable'], medium: ['email'], channel: 'Email', subchannel: 'Marketing Email' },
  
  // Direct
  'direct': { source: ['direct', '(direct)'], medium: ['(none)', 'none', 'direct'], channel: 'Direct', subchannel: 'Direct' },
};

// ===== NORMALIZATION LOGIC =====
function normalizeUTM(source, medium, campaign) {
  let channel = 'Unknown';
  let subchannel = 'Unknown';
  let campaignType = 'Unknown';
  let validationFlag = '';
  
  // Check for empty/null UTMs
  if (!source && !medium) {
    validationFlag = 'MISSING_UTMS';
    return { channel, subchannel, campaignType, validationFlag };
  }
  
  // Map to standard channel
  for (const [pattern, rules] of Object.entries(channelMap)) {
    const sourceMatch = rules.source.includes(source);
    const mediumMatch = rules.medium.includes(medium);
    
    if (sourceMatch && mediumMatch) {
      channel = rules.channel;
      subchannel = rules.subchannel;
      break;
    }
  }
  
  // Extract campaign type from utm_campaign
  if (campaign.includes('brand')) campaignType = 'Brand';
  else if (campaign.includes('nonbrand') || campaign.includes('non-brand')) campaignType = 'Non-Brand';
  else if (campaign.includes('retargeting') || campaign.includes('remarketing')) campaignType = 'Retargeting';
  else campaignType = 'Other';
  
  // Flag non-standard values
  if (channel === 'Unknown') {
    validationFlag = `NON_STANDARD_UTM: source=${source}, medium=${medium}`;
  }
  
  return { channel, subchannel, campaignType, validationFlag };
}

// ===== EXECUTE =====
const result = normalizeUTM(rawSource, rawMedium, rawCampaign);

// Return output for use in next Zapier steps
output = {
  channel: result.channel,
  subchannel: result.subchannel,
  campaign_type: result.campaignType,
  validation_flag: result.validationFlag,
  raw_source: rawSource,
  raw_medium: rawMedium,
  raw_campaign: rawCampaign
};