import { OfferLetterDocument } from "./OfferLetterDocument";
import { SolaraOfferLetterDocument } from "./SolaraOfferLetterDocument";
import { ElasticRunAgreementDocument } from "./ElasticRunAgreementDocument";
import { FirstClubFullTimeOfferLetterDocument } from "./FirstClubFullTimeOfferLetterDocument";
import { FirstClubPartTimeOfferLetterDocument } from "./FirstClubPartTimeOfferLetterDocument";
import { TriveniOfferLetterDocument } from "./TriveniOfferLetterDocument";

// Each new client format gets a key here + its own Document component file
// (copy an existing one and only change the clause wording, per the client's format).
export const OFFER_LETTER_TEMPLATES = {
  default: { label: "Default", component: OfferLetterDocument },
  solara: { label: "Solara", component: SolaraOfferLetterDocument },
  elasticrun: { label: "Elastic Run", component: ElasticRunAgreementDocument },
  "firstclub-fulltime": { label: "First Club Full Time", component: FirstClubFullTimeOfferLetterDocument },
  "firstclub-parttime": { label: "First Club Part Time", component: FirstClubPartTimeOfferLetterDocument },
  triveni: { label: "Triveni (BLR)", component: TriveniOfferLetterDocument },
};

export function getOfferLetterComponent(key) {
  return (OFFER_LETTER_TEMPLATES[key] || OFFER_LETTER_TEMPLATES.default).component;
}
