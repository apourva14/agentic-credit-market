WFAP 1.0 – Wells Fargo Agent Protocol (Financial
Agent Interface)
## Overview
Wells Fargo Agent Protocol (WFAP) 1.0 is a communication standard for AI agents negotiating financial
products in an open marketplace. It enables a Consumer Agent (e.g. a company’s AI CFO) to broadcast
a  credit  request  Intent and  receive  structured  Offer responses  from  multiple  Bank  Agents (AI
representing financial institutions)
. Each bank’s agent verifies the sender’s identity, performs
risk and compliance checks (creditworthiness, AML/KYC), and returns a machine-readable signed offer
quote with terms (interest rate, repayment schedule) and ESG impact details
. The consumer’s agent
evaluates all offers and selects the best one based on criteria like  lowest carbon-adjusted interest
rate, favorable terms, and a clear ESG summary
. This protocol supports iterative negotiation
(counter-offers) and final deal confirmation, culminating in a “winning” offer after one or more rounds
of bids
Goals and Scope: WFAP 1.0 defines the message schemas and interaction flow for agent-to-agent
negotiations of financial instruments in a product-agnostic way. It is initially applied to credit products
(e.g. business lines of credit and consumer credit cards), but is designed to be extensible to other
instruments.  The  protocol  emphasizes  interoperability  (standard  JSON  messages),  security  (digital
signatures for authenticity), and regulatory compliance (fields to facilitate identity verification, audit
logging, and checks like AML/CFT). By using WFAP, any company’s finance agent can interact with any
bank’s lending agent over a standardized interface to secure financing autonomously, while ensuring
trust and compliance in each step
## Roles and Identities
Consumer Agent (WFAP Client): Initiates the interaction on behalf of a borrower (a business or
individual). It constructs an Intent request describing the needed financial product and terms,
then sends this to one or more bank agents. The consumer agent must attach its  identity
credentials and  digital  signature to  prove  the  request’s  origin  and  integrity
.  It  is
responsible for verifying the identities and signatures on incoming offers, evaluating offer terms,
and ultimately choosing an offer to accept. This agent could represent, for example, Company X
seeking a line of credit or an individual seeking a credit card.
Bank Agent (WFAP Server): Listens for incoming Intents (credit requests) from clients and
responds  on  behalf  of  a  financial  institution.  Upon  receiving  an  Intent,  a  bank  agent
authenticates the sender’s identity and may perform background checks (credit score lookup,
KYC/AML screening, etc.)
. If the request is feasible, the bank agent formulates an Offer –
including proposed terms and an ESG impact summary – signs it digitally, and returns it to the
consumer  agent
.  Each  bank  agent  has  its  own  institution  identity  (e.g.  digital
certificate or token) so that the client can verify the offer’s source. Bank agents can also decline
or ignore requests outside their criteria (optionally sending a refusal message).

Digital Identities: Every agent in WFAP has a unique identity, anchored by cryptographic credentials
(e.g. a public/private key pair with a certificate). The  sender’s identity information and a digital
signature are included in each message. This allows the recipient to verify who sent the message and
that its contents were not tampered with
. For example, a company’s agent might include a
digital certificate issued by a trusted authority, and a bank agent might include a token or certificate
proving it is an authorized lender. These identity mechanisms align with emerging digital ID schemes
that let participants re-use verified identity and KYC attributes across financial services
. A trust
framework (e.g. a certificate authority or distributed ledger of known agent identities) is assumed so
that agents can validate each other’s credentials.
## Message Schema: Intent (Credit Request)
The Intent message is a structured JSON payload sent by a consumer agent to request a credit product.
It serves as a “call for proposals” describing what the borrower needs, in sufficient detail for banks to
respond
. The Intent includes:
Header Fields:
messageId: Unique identifier for the request message (UUID or similar).
messageType: "Intent"  (denotes this is a request).
timestamp: Time of request creation (for freshness and logging).
version: Protocol version (e.g. "WFAP/1.0" ) to handle future compatibility.
Requester Identity:
senderId: Unique ID of the sender (e.g. company’s D‑U‑N‑S number or individual’s national ID).
senderName: Human-readable name of the entity (e.g. "Company X Inc." ).
senderType: Type of entity ( "Organization"  for business, "Individual"  for person, etc.).
credentials: Optional identity credential object or reference (such as a digital certificate, public
key, or verifiable credential token proving KYC) for the sender. This could be a certificate chain or
an identity token that the bank can use to verify the client’s legitimacy. Including a standardized
identity proof helps banks rapidly trust the identity
Product Requirements:
productType: The category of credit product requested (e.g. "BusinessLineOfCredit"  or
"ConsumerCreditCard" ). This field triggers the relevant interpretation of terms and any
product-specific extensions.
amount: Requested credit amount (principal), in numeric form.
currency: Currency code (e.g. "USD" ).
term: Desired credit term or duration. For term-based loans or lines, this could be in months or
years (e.g. 12  months). For revolving products like credit cards with no fixed end date, this can
be "open-ended"  or a review period (or the field may be omitted if not applicable).
purpose: A short description or category of what the credit will be used for (e.g.  "Working
capital" , "Equipment purchase" , "Personal expenses" ). This helps banks assess risk
and compliance (for example, some purposes might be restricted under policy).
Policy Preferences (Optional):

maxRate: (Optional) A maximum acceptable interest rate or other threshold, if the requester
wants to set a limit (e.g. 0.07  for 7%).
esgPriority: (Optional) Indication of how important ESG considerations are to the requester (e.g.
a boolean or scale). For instance, a company deeply committed to sustainability might set a flag
here, which could encourage banks to include better ESG terms or summaries.
Security Fields:
signature: A digital signature over the entire Intent message (or critical parts of it) produced by
the sender’s private key. This ensures message integrity and authenticity
 – the bank
agent can cryptographically verify that the Intent truly came from the claimed sender and wasn’t
altered in transit.
signatureCertId: (Optional) an identifier for the public key or certificate corresponding to the
signature. For example, this could be a key ID or certificate thumbprint that tells the receiver
which key to use to verify the signature. (If the full certificate or key is included in the credentials
above, this may not be needed.)
Intent Example: Below is a simplified example of an Intent JSON for a business line of credit request. It
illustrates how the fields might be populated. (In practice, additional fields or nested structures could
appear, especially in credentials or preferences, but this covers the core schema.)
```json
{
"messageId": "req-2025-0001",
"messageType": "Intent",
"version": "WFAP/1.0",
"timestamp": "2030-07-15T10:00:00Z",
"productType": "BusinessLineOfCredit",
"amount": 500000,
"currency": "USD",
"term": 12,
"purpose": "Working capital expansion",
"senderId": "ORG123456789",
"senderName": "Company X Inc.",
"senderType": "Organization",
"credentials": {
"certificate": "-----BEGIN CERTIFICATE-----...<snip>...-----END
CERTIFICATE-----"
},
"signature": "<base64-digital-signature>",
"signatureCertId": "CompanyXCert#001"
}
```
In this example, Company X’s agent requests a \$500k line of credit for 12 months. It provides its
organization ID, name, and a digital certificate in the credentials. The message is signed ( signature )
so that any bank can verify it was indeed Company X’s authorized agent who sent the request. A
messageId  and  timestamp  are  included  for  tracking  and  freshness.  The  productType  being
"BusinessLineOfCredit"  tells receiving bank agents how to interpret the request and what kind of
offer to provide.

## Message Schema: Offer (Credit Offer Response)
The Offer message is the structured response sent by a bank agent to the consumer agent, proposing
terms for the requested credit. It serves as a proposal or quote that the consumer agent can consider,
and is also digitally signed by the bank agent to ensure authenticity
. Multiple offers from
different banks (or multiple rounds from the same bank) can be received for one Intent. Key fields in an
Offer include:
Header Fields:
messageId: Unique identifier for this offer message (so it can be referenced in acceptance or
further negotiation).
messageType: "Offer" .
inResponseTo: The messageId  of the Intent this offer is responding to. This links the offer to a
specific request.
timestamp: Time the offer was created.
Responder Identity:
senderId: Unique ID of the responding bank/institution (e.g. a bank’s registered ID or BIC code).
senderName: Name of the bank or financial institution (e.g. "Bank ABC Corp" ).
senderType: Type of entity ( "Bank"  or "FinancialInstitution" ).
credentials: Optional  credential  or  certificate  for  the  bank’s  identity  (similar  concept  as  in
Intent). The bank might include a public certificate or a signed token to prove this offer indeed
comes from an authorized source. There may also be a bankIdToken or code – for instance, the
problem  statement  suggests  a  “token  identifying  the  bank”
,  which  could  simply  be  an
identifier  like  a  short  code  or  could  be  a  cryptographic  token.  In  practice,  senderId  or
senderName  can serve to identify the bank; a separate bankToken  field could be included if,
say, the bank wants to remain pseudonymous during bidding (not likely here) or as a session
identifier.
Offer Terms:
approvedAmount: The amount of credit the bank is willing to extend. This may be equal to or
less than the requested amount, depending on the bank’s risk assessment.
currency: Currency of the offer (should usually match the request’s currency).
interestRate: The interest rate being offered (e.g. 0.05  for 5% annual rate). For a credit card,
this might represent the APR on purchases; for a line of credit, it could be an annual interest on
drawn funds. If the bank uses a carbon-adjusted interest rate, that can be reflected here or in
an additional field (see ESG info).
term: The duration for which the credit is offered or valid. For a term loan or line-of-credit, this
could be how long the credit line is available or until when it must be repaid. For a credit card
(which is revolving without a fixed end date), this field might be omitted or set to a review period
(e.g. card terms valid until further notice or an annual renewal).
repaymentSchedule: (Optional) Details on repayment if applicable (e.g. interest-only monthly
and principal due at maturity, or minimum monthly payment for credit cards). This could be a
reference or simple note since exact amortization might not be fixed for revolving credit.
ESG and Sustainability:

esgScore: A numeric or categorical score indicating the ESG (Environmental, Social, Governance)
performance or impact of this offer or the borrower (depending on how it’s defined). For
example, a score out of 10 or a letter grade. The bank computes this based on the loan’s purpose
and the borrower’s profile (perhaps using an ESG scoring model).
carbonAdjustment: (Optional) If the interest rate has been adjusted for carbon impact, this field
could quantify that adjustment (e.g. +0.005  added to base rate due to carbon footprint).
Alternatively, the interestRate given may already be carbon-adjusted. Including this field
explicitly can help the consumer agent understand how the rate was determined.
esgSummary: A human-readable short summary of the ESG impact or conditions associated
with this offer. Example: “This loan will finance renewable energy equipment, contributing to a
lower carbon footprint. The interest rate is discounted for positive ESG impact.” This text can be
generated by an LLM as per the project guidelines
. The summary helps a human understand
the sustainability aspects, and the consumer agent can also use it for justification logs or to
display to users.
Regulatory Compliance & Checks:
compliance: A section (object) that contains flags or notes about compliance checks. For
instance:
kycVerified: Boolean indicating the bank has verified the customer’s identity (KYC
passed).
amlScreening: Result of AML/CFT screening (e.g. "clear"  or a risk level like
"lowRisk" ).
creditScore: (If allowed to share) The credit score or risk grade the bank assessed for this
customer, which informed the offer. (In some implementations, the bank might not reveal
the exact score, but could give an ordinal category or just incorporate it into terms.)
regulatoryCert: (Optional) the bank’s own license or accreditation info if needed, or a
reference ID for the compliance process.
Including these fields ensures transparency and that the offer is “compliant by design.” For example, a
bank agent can indicate it verified the borrower’s identity and checked they are not on any sanctions list
before making the offer – information that could be logged for auditors. (The protocol doesn’t mandate
how the bank does these checks, just provides a place to note that they were done and their outcome.)
This is aligned with the requirement to include  identity and regulatory compliance fields in the
protocol
Security Fields:
signature: The bank agent’s digital signature over the offer message, produced with the bank’s
private key. The consumer agent will verify this signature to ensure the offer really originated
from the claimed bank and wasn’t altered in transit
signatureCertId: (Optional) Identifier for the bank’s public key/certificate corresponding to the
signature, if not already obvious from senderId  or included credentials.
Offer Example: Below is an example of an Offer JSON responding to the above Intent. This example
assumes the bank (Bank ABC) decided to fully meet the request with certain terms and has included
relevant ESG and compliance info.
```json
{
"messageId": "offer-ABC-001",
"messageType": "Offer",
◦
◦
◦
◦

"inResponseTo": "req-2025-0001",
"timestamp": "2030-07-15T10:00:05Z",
"senderId": "BANK123456",
"senderName": "Bank ABC",
"senderType": "Bank",
"credentials": {
"certificate": "-----BEGIN CERTIFICATE-----...<snip>...-----END
CERTIFICATE-----"
},
"approvedAmount": 500000,
"currency": "USD",
"interestRate": 0.050,
"term": 12,
"repaymentSchedule": "Interest-only monthly, principal due at end-term",
"esgScore": 8.5,
"carbonAdjustment": -0.002,
"esgSummary": "Financing solar equipment – positive environmental impact.
Interest rate discounted for low carbon footprint.",
"compliance": {
"kycVerified": true,
"amlScreening": "clear",
"creditScore": "A"
},
"signature": "<base64-digital-signature>",
"signatureCertId": "BankABC-Cert#202"
}
```
Here, Bank ABC offers \$500k at a 5.0% interest rate for 12 months, matching the requested amount
and term. The carbonAdjustment  of -0.002 indicates the rate was lowered by 0.2 percentage points
due to a positive ESG factor (perhaps the normal rate was 5.2% but the project’s eco-friendly nature
earned a discount). The esgScore  of 8.5/10 and the summary line provide qualitative context. The
compliance section shows the bank validated KYC (the borrower’s identity) and found no AML issues,
and it gives a credit grade of “A” for the borrower. The offer is signed by the bank’s agent, and the
consumer agent will verify this signature using Bank ABC’s public key.
## Interaction Protocol Flow
WFAP 1.0 follows a request-response negotiation pattern (inspired by the FIPA Contract-Net protocol
in multi-agent systems
) to ensure a structured dialogue. A typical interaction sequence is as follows:
Broadcast Intent: The Consumer Agent (initiator) sends an  Intent message to one or more
Bank Agents (responders). This could be a broadcast on a network marketplace or directed to
specific known bank endpoints. The Intent carries the credit request details and the sender’s
credentials/signature as described above.
Validate and Respond (or Ignore/Refuse): Each Bank Agent that receives the Intent will verify
the request: check the signature (authenticity of sender) and credentials (ensure the requester’s
identity is known/trusted), then evaluate the request against its lending criteria.

If the request is out of scope (e.g. amount too high, untrusted sender, disallowed purpose), the
bank agent may either ignore the Intent or send a Refusal message. (A refusal could be a simple
message indicating no offer will be made – WFAP could define an optional "Refusal"
messageType for this scenario, containing at least the inResponseTo  ID and perhaps a short
reason code. However, to keep the protocol brief, agents can also implicitly treat no response as
a refusal.)
If  the  request  is  acceptable,  the  bank  agent  proceeds  to  compose  an  Offer message.  It
calculates terms (possibly using internal pricing models and policy rules), performs any required
ESG analysis for the summary, and compiles the Offer fields. The bank agent signs the Offer and
sends it back to the consumer agent
. This entire process is typically fast and automated.
Each bank’s offer will have a unique messageId  and reference the original Intent ID.
Consumer Gathers Offers: The Consumer Agent waits for responses (perhaps within a certain
time  window).  It  collects  all  Offer  messages  from  different  banks  (the  hackathon  scenario
expects at least three offers)
. For each Offer, the consumer agent verifies the signature (to
ensure the offer indeed comes from the stated bank and was not altered) and checks the bank’s
credentials/identity. It will reject any offer whose signature is invalid or whose sender identity is
not recognized or trusted (e.g. not in its list of known banks or not signed by a known authority).
Valid offers are then parsed for their terms.
Evaluation and Negotiation: The Consumer Agent evaluates the valid offers to determine
which best meets the objectives. Criteria are likely encoded in the consumer’s internal policy –
for example, find the lowest carbon-adjusted interest rate first, then consider other terms
like approved amount and repayment period, and possibly the quality of the ESG summary
. The consumer may also factor in its own preferences (e.g. favoring a bank with better ESG
score if interest rates are similar). This decision process should be logged for audit (the agent
might record something like: “Offer X had lowest effective rate after carbon adjustment, so it was
chosen over Offer Y with higher rate but similar amount”).
Optional Counter-Offer: If none of the offers are satisfactory or if the consumer agent sees
room for improvement, WFAP allows iterative negotiation. The consumer agent could send a
revised Intent or a counter proposal to one or more banks. This could be done by sending a
new Intent message with the same messageId  (or a new ID referencing the previous one) and
perhaps a field indicating it’s a counter (e.g. an increased or decreased requested amount, or a
target  interest  rate).  Alternatively,  a  simpler  approach  is  that  the  consumer  agent  directly
contacts one of the banks (likely the top candidate) with a Negotiation message or a new Intent
adjusting terms (for example: “Interest rate X% is a bit high, can you do better if we shorten the
term?”). The protocol can accommodate this by repeating the Intent→Offer cycle with updated
parameters, as long as both parties recognize the ongoing negotiation session (using the same
original request ID or a session ID).
In this 1.0 version, the specifics of multi-round negotiation are kept flexible: agents may either
stick to one-shot offers or engage in an iterated contract-net cycle
. Each new Intent or Offer
in subsequent rounds should reference the original negotiation (e.g., use the same messageId
or a dedicated conversationId ) to maintain context. For the hackathon implementation, it’s
acceptable to select the best initial offer without multiple rounds, but the protocol is designed
not to preclude extension into iterative bargaining.
Acceptance and Closure: Once the Consumer Agent decides on the winning offer, it will send
an Acceptance message to the corresponding Bank Agent to finalize the deal. The Acceptance

message would include: the reference to the chosen offer ( offerId ), the original request ID,
the  consumer’s  signature  (to  confirm  acceptance),  and  any  final  agreement  details  (like  a
contract  ID  or  next  steps).  The  chosen  bank  agent  would  acknowledge  and  proceed  with
executing the credit provision (outside the scope of WFAP messaging). Meanwhile, the consumer
agent may send polite  Rejection notices to the other offers or simply let them expire. In a
formal extension of WFAP, explicit  "AcceptOffer"  and  "RejectOffer"  message types
could be defined, but for brevity, an implicit approach (one accept message and silence as
rejection for others) can be used. The protocol ensures that only one offer is ultimately accepted
for a given Intent, to avoid double-commitment.
Logging and Audit Trail: Throughout the process, each agent logs the steps taken. The bank
agents log how they validated the request (e.g. “Verified sender’s cert, ID matches Company X,
credit score fetched, AML check passed”) and how they decided on terms. The consumer agent
logs how it verified each bank’s identity and offer integrity and the reasoning for the choice
These logs aren’t transmitted as part of the protocol messages, but the presence of IDs (request
IDs, offer IDs, agent IDs) in the messages makes it easy to correlate logs to specific negotiation
sessions. The consistent use of digital signatures also means any dispute later can be resolved
by checking the signed messages (non-repudiation).
Fault Tolerance: If a message is not understood or violates schema, the receiving agent can ignore it or
reply with an error (not formally defined in WFAP 1.0, but a "NotUnderstood"  or "Error"  message
type could be introduced in future). Agents should handle timeouts (e.g. if no offers return in time, the
consumer agent can decide to retry or report failure). Security-related failures (bad signature, untrusted
certificate) should result in the message being discarded and possibly an alert in logs.
## Security and Identity Verification
Security is a first-class concern in WFAP. All messages are digitally signed by the sender to ensure
authenticity and integrity
. This means a malicious party cannot impersonate a bank or a client
without possession of the private keys, and any tampering with message content would be detected
during signature verification. The protocol does not hardcode a specific signature standard, but JSON
Web  Signature  (JWS)  or  similar  schemes  are  recommended  for  their  compactness  and  web
compatibility. A signed message in WFAP thus provides cryptographic proof of origin and content –
fulfilling the requirement that responses be machine-readable yet verifiable
. As noted in an IETF
standard, a JSON Web Signature ensures information is transmitted in a form that includes “proof that
the information hasn't changed since being signed”
, which is crucial for financial offers.
Identity management: Agents must exchange or have access to each other’s public keys or certificates
beforehand (either through a trusted registry, PKI, or during an initial handshake not covered in WFAP
1.0). The credentials fields in messages help facilitate this by carrying necessary identity proofs. For
example, a consumer agent’s Intent might include its digital certificate (issued by a known authority or
perhaps by Wells Fargo in this hackathon context) so that any bank agent can verify the signature
against that certificate. Likewise, a bank’s Offer can include a certificate or at least an identifier for its
public key, allowing the consumer to verify the offer. All certificates or keys used should be of a
sufficient strength (e.g. RSA or ECC keys with modern standard sizes) and ideally traceable to a root of
trust  recognized  by  all  parties.  In  a  production  scenario,  a  directory  of  agent  public  keys  or  a
decentralized identity (DID) system could be used.
Confidentiality: WFAP 1.0 primarily addresses authentication/integrity. If confidentiality is required (to
prevent eavesdroppers from seeing sensitive financial details), the communication channel should be

encrypted (e.g. using TLS for transport). Alternatively, the protocol messages themselves could be
encrypted using a JSON Web Encryption (JWE) layer, or the agents could encrypt specific fields (like using
the bank’s public key to encrypt the Intent details). For hackathon purposes, we assume a secure
channel or environment, but these extensions can be added without changing the core schema.
Verification Steps: Upon receiving a message, an agent will:
- Check the message’s structural compliance with WFAP schema (all required fields present, etc.).
- Verify the  signature  using the sender’s public key (identified by the certificate or key ID). If
signature verification fails, the message is discarded or considered invalid.
- Verify the sender’s identity and authority: e.g. check the certificate’s validity (not expired, issued by
trusted  CA),  ensure  the  senderId  matches  the  identity  in  the  certificate,  and  that  the  sender  is
authorized to make this request/offer. For instance, a bank agent confirming that Company X’s request is
signed by a key legitimately belonging to Company X, or a consumer agent confirming an offer really
came from Bank ABC.
- Optionally, check for replay attacks by using the  messageId  and timestamp (e.g. ensure it hasn’t
processed a message with that ID before, and the timestamp is recent). Nonces or sequence numbers
could be introduced in future versions for additional anti-replay protection.
By enforcing these checks, the protocol provides a  standard identity verification interface at the
communication layer: any WFAP-compliant agent will know to expect signed messages and how to
validate them. This lays the groundwork for thorough background checks – for example, once a client’s
identity is verified, a bank can then safely pull that entity’s credit report and run it through AML
databases as part of its internal processing (outside the protocol scope, but enabled by having a reliable
identity in the Intent).
## Compliance and Audit Considerations
Financial transactions must comply with regulations (e.g. KYC, AML, data security) and WFAP is designed
to help agents adhere to these requirements. Several features in WFAP 1.0 support compliance:
Identity and KYC: The inclusion of robust identity credentials in the Intent means that the bank
agent has what it needs to perform KYC checks. For example, the Intent could be accompanied
by a digital KYC certificate or an identity token that states the client’s verified identity (perhaps
issued by a government or trusted third party). The FATF (global AML standards body) has
emphasized the benefit of digital identity schemes that allow consumers to re-use verified
identities across financial services
 – WFAP leverages this idea by allowing such credentials to
travel with the Intent. The bank agent can automatically confirm the client’s identity from the
WFAP message and ensure it’s dealing with a legit entity before proceeding. This streamlines
compliance since the alternative would be to separately ask for identity documents or data.
AML/CFT Screening: Upon receiving an Intent, a bank agent should run the necessary AML/CFT
(Anti-Money Laundering/Counter Financing of Terrorism) checks as required by law. This might
involve checking the requester against sanction lists, verifying the nature of the business, and
ensuring the loan purpose is not illicit. While these checks happen internally or via external APIs,
the  protocol’s  logging  and  fields  help  document  it.  The  bank’s  Offer  can  include  an
amlScreening  result in the compliance section to explicitly record that the client was screened
and found clear (or if not clear, the bank likely wouldn’t offer). If a bank agent finds an AML red
flag (say the company is on a sanctions list), it would simply not respond or send a refusal – and
it would log the reason internally. The presence of the purpose  field in the Intent also aids

AML  checks  (certain  purposes  might  trigger  enhanced  scrutiny  or  automatic  rejection  per
regulations).
Regulatory Compliance Fields: WFAP messages carry data that regulators may want to see in
an audit. For instance, by including the ESG information and how the interest rate is adjusted for
carbon, the protocol is implicitly supporting emerging regulations around sustainable finance
disclosure.  Also,  any  field  like  creditScore  in  the  offer’s  compliance  section  provides
transparency into why certain terms were offered (helpful for fair lending audits or internal risk
governance). The protocol can be extended to include more compliance data as needed (for
example, a reference to a particular regulation or a model’s output used in decision). The key is
that it  “bakes in” compliance considerations from the start rather than treating them as
afterthoughts.
Audit Logging: Each agent maintains an audit trail of the negotiation
. On the bank side, the
log will show that an Intent was received from X, at time Y, signature verified, checks performed
(with outcomes), offer terms decided, and Offer sent (with signature). On the consumer side, the
log shows Intent sent (and to whom), offers received from A, B, C at times, results of signature
checks, and the decision process for selection. Because WFAP uses unique IDs and timestamps,
these  logs  can  be  unambiguously  tied  to  specific  message  exchanges.  If  a  regulator  or
administrator needs to review how a particular credit deal was made, the logs and the signed
messages can be used to reconstruct the sequence and verify that proper procedure was
followed. For example, if there’s a question of whether the bank properly verified identity, the
logs and the presence of kycVerified: true  in the offer provide evidence that it did – along
with the fact that the offer was signed, making it non-repudiable.
Non-Repudiation: Since both request and offer are signed, neither party can later deny their
involvement. The company cannot claim “We never requested that loan” (their signed Intent is
proof), and the bank cannot claim “We never offered those terms” (the signed Offer is proof).
This is important for enforcement and trust in an autonomous agent setting.
Privacy: WFAP transmits necessary information for the deal, but it’s mindful of privacy. Sensitive
data (like detailed financial statements or personal info beyond identity) are not included in the
base protocol; those could be handled via secure data rooms or APIs if needed, outside of
WFAP’s scope. The identity credentials shared should also follow privacy best practices (e.g. not
oversharing data that’s not needed for the transaction). For instance, a verifiable credential
might assert “KYC passed” without revealing personal details to every bank agent, or it could use
a blinded identifier so that banks only learn what’s required. Implementers should consider data
minimization and compliance with privacy laws (like GDPR) when deciding what goes into the
credentials  field.  However,  since  this  is  a  hackathon-level  design,  we  assume  a  controlled
environment and focus on functionality.
In summary, WFAP 1.0 includes built-in slots for identity and compliance information so that AI agents
can perform due diligence on each other automatically, meeting obligations such as verifying
counterparty identity, checking for illicit activity, and explaining decision rationale – all of which are
critical in financial negotiations.
## Extensibility and Product-Specific Extensions
One of the strengths of WFAP 1.0 is that it is product-agnostic yet extensible. The core schema covers
the common elements needed for most credit offers (amount, interest, term, etc.), while allowing

flexibility to add fields for specific products or future enhancements. This design means the same
protocol can facilitate both commercial lending (e.g. business lines of credit) and consumer lending
(e.g. credit cards), among others, with only minor variations:
Product Type Differentiation: The productType  field in the Intent clearly indicates what kind
of financial product is being requested. Bank agents can filter or route Intents based on types
they handle (a consumer credit card agent might ignore a business loan Intent and vice versa). It
also informs how to interpret the fields. For example, a  "ConsumerCreditCard"  request
might imply that  term  is not a fixed loan duration but could be interpreted as “desired
promotional period” or simply ignored. A  "BusinessLineOfCredit"  suggests a revolving
credit line for a business, so the bank might expect a term (like review period) and perhaps
information on collateral (if any) or guarantees.
Optional Fields per Type: WFAP allows additional fields to be present in the JSON that aren’t in
the core schema, as long as they don’t conflict. Agents should ignore fields they don’t recognize,
or gracefully handle unknown data. This means we can introduce new fields for certain products:
For a Line of Credit: We might add a field in the Intent like "collateral"  (to specify if the line is
secured by any asset) or "drawDownSchedule"  if the borrower expects to draw funds in
stages. In the Offer, the bank could include "utilizationFee"  (if they charge a fee on
unused credit line) or "collateralRequirement"  if they require collateral.
For a Credit Card: We could add "cardTypePreference"  in the Intent (e.g. "Visa"  or
"MasterCard"  or certain reward categories the consumer wants). In the Offer, the bank might
include fields like "creditLimit"  (though in our design approvedAmount  already serves
that role), "annualFee" , or "rewardRate"  (for cashback or points). These are not relevant
to a line of credit, but the protocol can carry them when productType  is credit card.
The schema could also extend to other products: e.g. a term loan might include an amortization
schedule or a mortgage might include a property address field, etc. WFAP 1.0’s flexibility enables
these to be added as needed.
Versioning: The protocol version field (e.g.  "WFAP/1.0" ) allows for evolution. New versions
can  introduce  new  standard  fields  or  message  types.  Agents  can  negotiate  or  auto-detect
version upgrades. For instance, WFAP 1.1 might formally add a  "CounterOffer"  message
type for explicit two-way negotiations, or define more elaborate compliance data structures.
Because 1.0 messages are JSON, they can often be forward-compatible (extra fields ignored by
older agents). Proper versioning ensures an older agent won’t misinterpret a newer message – it
would see an unknown version and could either try a fallback or reject with a version not
supported error.
Schema Publication: As part of this project, the WFAP schema definitions can be provided in a
formal way (e.g. JSON Schema or JSON-LD context)
. That means each message type (Intent,
Offer, etc.) has a schema that can be validated. Developers of new financial agent types can refer
to these schemas and extend them. For example, one could publish an extension schema for
"MortgageIntent"  that inherits base Intent fields and adds a property for home address or
appraisal value. Because WFAP is inspired to be analogous to an open standard (like how HTTP
has methods but can be extended), we envision a community or governing body (possibly Wells
Fargo and partners) maintaining the standard.

Instrument Modules: In implementation, one might design the agent software so that product-
specific logic is modular. The WFAP message comes in, the core fields are handled by the
common protocol layer, then it dispatches to a product-specific module if  productType  is
recognized.  That  module  knows  how  to  evaluate  or  generate  offers  for  that  product.  This
modular approach aligns with WFAP’s goal of being extendable to new instruments with minimal
changes to the core communication fabric.
By making WFAP extendable, we ensure that adding a new financial product or adapting to new
regulatory  requirements  does  not  require  a  complete  overhaul  of  the  protocol.  This  protects  the
investments  into  systems  built  on  WFAP  –  they  can  grow  with  the  market.  For  the  hackathon
demonstration, we specifically show it working for a business line of credit scenario and a consumer
credit card scenario to prove that the protocol design is versatile. In both cases, the agents use the
same message framework, with differences only in a couple of fields and internal decision logic.
## Conclusion & Example Use Case Narrative (Illustrative)
To tie everything together, imagine the following narrative in the year 2030 using WFAP 1.0:
Company X’s AI CFO needs financing and issues an Intent for a \$500,000 line of credit
. The Intent
is signed and includes Company X’s digital ID and the purpose “Working capital for expanding green
energy  projects.”  Bank   ABC’s  agent receives  this  request,  verifies  the  signature  (it  recognizes
Company X’s certificate as one of a reputable client) and runs an automated check: Company X’s credit is
good, and the purpose is in a favored category (green projects). The agent also performs an instant
AML check via an API – all clear. Bank ABC’s policies allow up to \$600k for such clients, so it prepares an
Offer: \$500k approved, 5% interest, 12-month revolving line, with a note that because the project is
eco-friendly, they applied a carbon interest discount, effectively making the rate lower than standard
. The bank’s agent uses an LLM to generate a friendly ESG summary: “Financing solar expansion
– aligns with our sustainability goals, hence a rate discount.” It signs the offer and sends it back. Three
other banks do similarly, each with different rates and terms.
Company X’s agent collects 4 offers in total
. It verifies all signatures – one fails (a fake offer from an
untrusted source), so that one is discarded. Among the remaining, Bank ABC’s offer has the lowest
carbon-adjusted rate (5% with a small carbon discount) and meets the full amount needed, whereas
another offer was 5.5% for the full amount and a third offered 5% but only \$300k. The agent’s decision
module,  following  Company   X’s  policy  (which  prioritizes  cost  of  capital  and  ESG  impact),  selects
Bank ABC as the winner. Company X’s agent sends an  Acceptance message to Bank ABC’s agent,
referencing the offer ID and signing the acceptance. It also logs the reasoning: “Selected offer ABC for
lowest effective interest and adequate amount; ESG impact positive.” Bank ABC’s agent receives the
acceptance, verifies it, and then proceeds to finalize the credit line (perhaps through execution of a
smart contract or by generating official loan documents). The other banks either receive a polite
rejection message or infer it from no acceptance.
Throughout this process, every critical action was logged and every message was cryptographically
verifiable.  Later,  an  auditor  reviewing  the  logs  can  see  that  Company  X’s  agent  only  chose  after
confirming each bank’s identity and offer integrity
, and that Bank ABC did indeed perform its checks
before offering (as evidenced by the compliance flags in its Offer). The WFAP 1.0 protocol thus enabled
a  seamless,  autonomous  negotiation  that  respected  security  and  compliance,  paving  the  way  for
“Super-CFO” AI agents to reliably manage financial deals in a multi-bank marketplace.

Technology_Hackathon_Brief.pdf

https://www.cs.sjsu.edu/faculty/pearce/modules/lectures/abs/jadeweb/fipaIPs.htm
JSON Web Signature - Wikipedia
https://en.wikipedia.org/wiki/JSON_Web_Signature
OPPORTUNITIES AND CHALLENGES OF NEW TECHNOLOGIES FOR AML/CFT
https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Opportunities-Challenges-of-New-Technologies-for-AML-
CFT.pdf.coredownload.pdf