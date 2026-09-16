import { OfferLetterDocument } from "./OfferLetterDocument";
import { SolaraOfferLetterDocument } from "./SolaraOfferLetterDocument";
import { ElasticRunAgreementDocument } from "./ElasticRunAgreementDocument";

// Each new client format gets a key here + its own Document component file
// (copy an existing one and only change the clause wording, per the client's format).
export const OFFER_LETTER_TEMPLATES = {
  default: { label: "Default", component: OfferLetterDocument },
  solara: { label: "Solara", component: SolaraOfferLetterDocument },
  elasticrun: { label: "Elastic Run", component: ElasticRunAgreementDocument },
};

export function getOfferLetterComponent(key) {
  return (OFFER_LETTER_TEMPLATES[key] || OFFER_LETTER_TEMPLATES.default).component;
}
