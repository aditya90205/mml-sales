/** Shared intake booklet schema, demo values, and field helpers. */

export const SECTIONS_META = [
  { key: "personal", label: "Personal details" },
  { key: "education", label: "Education & career" },
  { key: "residency", label: "Residency & previous marriage" },
  { key: "family", label: "Family — father & mother" },
  { key: "siblings", label: "Siblings & family standing" },
  { key: "match", label: "Match desired" },
  { key: "essential", label: "Essential questions for relationship success" },
  { key: "medical", label: "Medical history disclosure" },
  { key: "declaration", label: "Declaration & check list" },
  { key: "communication", label: "Communication, consent & privacy" },
  { key: "casesheet", label: "Case sheet — for official use" },
];

export const OVERALL_TOTAL_FIELDS = 270;
export const OVERALL_FILLED_FIELDS = 145;

const PERSONAL_DETAILS_BLOCKS = [
  {
    title: "Who is this",
    fields: [
      { key: "gender", label: "Gender", required: true, type: "pill", options: ["Male", "Female"] },
      { key: "firstName", label: "First name", required: true, type: "text" },
      { key: "middleName", label: "Middle name", type: "text" },
      { key: "lastName", label: "Last name", required: true, type: "text" },
      { key: "clientType", label: "Client type", required: true, type: "pill", options: ["Classic", "Premium", "Exclusive"] },
      { key: "profileStatus", label: "Profile status", type: "pill", options: ["Draft", "Under review", "Complete"] },
      { key: "maritalStatus", label: "Marital status", required: true, type: "pill", options: ["Never married", "Divorced", "Widow / Widower", "Annulled"] },
      { key: "lookingFor", label: "Looking for", required: true, type: "pill", options: ["Groom", "Bride"] },
      { key: "enquiryBy", label: "Enquiry made by", type: "pill", options: ["Self", "Parent", "Sibling", "Relative"] },
    ],
  },
  {
    title: "Identity & contact",
    fields: [
      { key: "panNo", label: "PAN No", type: "upload", note: "Card image optional — front and back" },
      { key: "aadhaarNo", label: "Aadhaar No", type: "upload", chipsKey: "aadhaarFiles" },
      { key: "mobile", label: "Mobile", required: true, type: "text" },
      { key: "alternateContact", label: "Alternate contact", type: "text" },
      { key: "email", label: "E-mail", required: true, type: "text" },
    ],
  },
  {
    title: "Birth & astrology",
    fields: [
      { key: "dob", label: "Date of birth", required: true, type: "text" },
      { key: "timeOfBirth", label: "Time of birth", type: "text" },
      { key: "placeOfBirth", label: "Place of birth", required: true, type: "text" },
      { key: "nativePlace", label: "Native place", type: "text" },
      { key: "zodiacSign", label: "Zodiac sign", type: "text" },
      { key: "gotra", label: "Gotra", type: "text" },
      { key: "manglik", label: "Astrologically you are", type: "pill", options: ["Non Manglik", "Manglik", "Slightly Manglik", "Don't know"] },
      { key: "nakshatra", label: "Nakshatra", type: "text" },
      { key: "gan", label: "Gan", type: "pill", options: ["Dev", "Manushya", "Rakshas"] },
      { key: "nadi", label: "Nadi", type: "pill", options: ["Aadi", "Madhya", "Antya"] },
      { key: "kundliPoints", label: "Kundli gun points (of 36)", type: "text" },
      { key: "kundliShown", label: "Kundli shown to client", type: "pill", options: ["On request only", "Shared"] },
    ],
  },
  {
    title: "Community",
    fields: [
      { key: "religion", label: "Religion", required: true, type: "pill", options: ["Hindu", "Sikh", "Jain", "Muslim", "Christian", "Other"] },
      { key: "sectCaste", label: "Sect / caste", required: true, type: "text" },
      { key: "subCaste", label: "Sub-caste", type: "text" },
      { key: "motherTongue", label: "Mother tongue", type: "text" },
    ],
  },
  {
    title: "Body & health",
    fields: [
      { key: "height", label: "Height", required: true, type: "text" },
      { key: "weight", label: "Weight (kg)", type: "text" },
      { key: "bodyType", label: "Body type", type: "pill", options: ["Slim", "Average", "Athletic", "Broad build", "Heavy", "Very heavy"] },
      { key: "bloodGroup", label: "Blood group", type: "pill", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
      { key: "complexion", label: "Complexion", type: "pill", options: ["Very fair", "Fair", "Wheatish", "Wheatish to dark", "Dark"] },
      { key: "spectacles", label: "Spectacles / contact lenses", type: "pill", options: ["Yes", "No"] },
      { key: "leftEyePower", label: "Left eye power", type: "text" },
      { key: "rightEyePower", label: "Right eye power", type: "text" },
      { key: "disability", label: "Any disability or health issue", type: "pill", options: ["Yes", "No"] },
      { key: "disabilitySpecify", label: "If yes, specify", type: "text" },
      { key: "conditionSince", label: "Condition since (year)", type: "text" },
      { key: "underTreatment", label: "Under treatment", type: "pill", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Habits",
    fields: [
      { key: "drinking", label: "Drinking", type: "pill", options: ["Teetotaller", "Occasionally", "Regularly", "Socially"] },
      { key: "smoking", label: "Smoking", type: "pill", options: ["Non smoker", "Occasionally", "Regular", "Socially", "Hukka"] },
      { key: "eating", label: "Eating", type: "pill", options: ["Vegetarian", "Eggetarian", "Non vegetarian", "Occasionally non-veg", "Socially", "Vegan"] },
      { key: "drinkingNote", label: "Drinking — note", type: "text" },
      { key: "smokingNote", label: "Smoking — note", type: "text" },
      { key: "eatingNote", label: "Eating — note", type: "text" },
    ],
  },
  {
    title: "In the client's words",
    columns: 1,
    fields: [
      { key: "characteristics", label: "Characteristics", type: "textarea" },
      { key: "extraInfo", label: "Extra info (personal)", type: "textarea" },
    ],
  },
];

const QUALIFICATION_ROW_FIELDS = [
  { key: "level", label: "Level" },
  { key: "course", label: "Course (with duration)" },
  { key: "stream", label: "Stream" },
  { key: "institution", label: "Institution" },
  { key: "year", label: "Year of passing" },
  { key: "pct", label: "% / CGPA" },
];

const EDUCATION_BLOCKS = [
  {
    title: "Education",
    fields: [
      { key: "hobbies", label: "Hobbies you pursue", type: "text" },
      { key: "languagesKnown", label: "Languages known", type: "text" },
      { key: "board", label: "Board", type: "pill", options: ["CBSE", "ICSE", "State board", "IB", "IGCSE", "Other"] },
      { key: "top10Institution", label: "Top-10 institution", type: "pill", options: ["Yes", "No"] },
      { key: "foreignEducation", label: "Foreign education", type: "pill", options: ["Yes", "No"] },
      { key: "ivyLeague", label: "Ivy League / IIM", type: "pill", options: ["Yes", "No"] },
      { key: "studyAbroadCountry", label: "Country (if studied abroad)", type: "text" },
      {
        key: "courses",
        label: "Courses (most recent first)",
        type: "rows",
        rowLabel: "Qualification",
        fullWidth: true,
        rowCount: 4,
        rowFields: QUALIFICATION_ROW_FIELDS,
      },
      { key: "distinctAchievements", label: "Distinct achievements", type: "textarea" },
    ],
  },
  {
    title: "Work",
    fields: [
      {
        key: "occupation",
        label: "Occupation",
        type: "pill",
        options: ["Independent", "Business (joint / nuclear)", "Professional", "Self employed", "Industrialist", "Bureaucrat", "Private sector", "Student"],
      },
      {
        key: "occupationCategory",
        label: "Occupation category",
        type: "pill",
        options: ["Doctor", "Engineer", "Lawyer", "CA / CS", "Banker", "Civil services", "Academia", "Media", "Architect / designer", "Defence", "Merchant navy", "Businessman", "Other"],
      },
      { key: "subSpeciality", label: "Sub-speciality", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "workingSince", label: "Working since", type: "text" },
      { key: "workingUntil", label: "Working until (if a past role)", type: "text" },
      { key: "personalAnnualIncome", label: "Personal annual income", required: true, type: "text" },
      { key: "salary", label: "Salary (p.a.)", type: "text" },
      { key: "organisationSpec", label: "Organisation & specification", type: "textarea" },
    ],
  },
  {
    title: "Where you live",
    fields: [
      { key: "currentlyReside", label: "Currently you reside in", type: "pill", options: ["Parental house", "Rented accommodation", "Company accommodation", "Own house"] },
      { key: "householdType", label: "Residential status", type: "pill", options: ["Joint house", "Nuclear house"] },
      { key: "stayingSince", label: "Staying since", type: "text" },
      { key: "previousAddress", label: "Previous address", type: "text" },
      { key: "shiftingToNewAddress", label: "Shifting to new address", type: "text" },
      { key: "residenceContact", label: "Contact", type: "text" },
      { key: "residenceEmail", label: "E-mail", type: "text" },
      { key: "currentAddress", label: "Current address", required: true, type: "textarea" },
    ],
  },
  {
    title: "Lifestyle & affiliations",
    fields: [
      { key: "politicalAffiliation", label: "Political affiliation", type: "pill", options: ["BJP", "AAP", "INC", "None", "Other"] },
      { key: "spiritualFollowing", label: "Spiritual following / guru", type: "text" },
      { key: "clubMemberships", label: "Club memberships", type: "text" },
      { key: "languageProficiency", label: "Language proficiency", type: "text" },
      { key: "socialActivities", label: "Social activities & organisations", type: "textarea" },
    ],
  },
  {
    title: "Online presence",
    fields: [
      { key: "linkedin", label: "LinkedIn", type: "text" },
      { key: "instagram", label: "Instagram", type: "text" },
      { key: "facebook", label: "Facebook", type: "text" },
      { key: "twitter", label: "X / Twitter", type: "text" },
      { key: "otherProfile", label: "Other profile", type: "text" },
    ],
  },
];

const RESIDENCY_BLOCKS = [
  {
    title: "Residency",
    fields: [
      {
        key: "residentialStatus",
        label: "Residential status",
        required: true,
        type: "pill",
        options: ["Indian", "NRI", "Temporarily abroad", "Citizen", "PR holder", "OCI"],
      },
      { key: "recentVisitCountry", label: "Most recent visit to country of origin", type: "text" },
    ],
  },
  {
    title: "If NRI",
    badge: "NOT APPLICABLE — resident client",
    fields: [
      { key: "visaType", label: "Visa type", type: "text" },
      { key: "accommodationAbroad", label: "Accommodation abroad", type: "pill", options: ["Own house", "Rented accommodation", "Company accommodation"] },
      { key: "passportCopy", label: "Passport copy", type: "pill", options: ["Received", "Pending"] },
      { key: "overseasAddress", label: "Overseas address", type: "textarea" },
    ],
  },
  {
    title: "Previous marriage",
    badge: "NOT APPLICABLE — first marriage",
    fields: [
      { key: "prevMarriageCase", label: "Case", type: "pill", options: ["For divorcee", "For annulled"] },
      { key: "marriageDate", label: "Marriage date", type: "text" },
      { key: "timeDuration", label: "Time duration", type: "text" },
      { key: "separationPeriod", label: "Separation period", type: "text" },
      { key: "formalitiesCompleted", label: "Formalities completed", type: "pill", options: ["Yes", "No", "On final stages"] },
      { key: "children", label: "Children", type: "pill", options: ["Do not have children", "Have children"] },
      { key: "noOfChildren", label: "No. of children", type: "text" },
      { key: "custody", label: "Custody", type: "pill", options: ["Yes", "No"] },
      { key: "prevMarriageCause", label: "Cause", type: "textarea" },
      { key: "prevMarriageStatus", label: "Status of case", type: "textarea" },
    ],
  },
  {
    title: "Address on record",
    fields: [
      { key: "addrContactPerson", label: "Contact person", type: "text" },
      { key: "addrContactInfo", label: "Contact info", type: "text" },
      { key: "addrAreaLocality", label: "Area / locality", type: "text" },
      { key: "addrAreaOfHouse", label: "Area of house (sq yd)", type: "text" },
      { key: "addrCity", label: "City", required: true, type: "text" },
      { key: "addrState", label: "State", type: "text" },
      { key: "addrPinCode", label: "Pin code", type: "text" },
      { key: "addrCountry", label: "Country", type: "text" },
      { key: "addrZone", label: "Zone", type: "pill", options: ["Delhi NCR", "Gurgaon", "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Other"] },
      { key: "addrRelation", label: "Relation to this address", type: "pill", options: ["Self", "Parent", "Relative", "Rented"] },
      { key: "addrHouseOwnership", label: "House ownership", type: "pill", options: ["Owned", "Rented", "Family", "Company provided"] },
      { key: "addrHouseType", label: "House type", type: "pill", options: ["Apartment", "Independent", "Villa", "Farmhouse", "Kothi"] },
      { key: "addrResidingCity", label: "Residing city", type: "text" },
      { key: "addrResidingCountry", label: "Residing country", type: "text" },
      { key: "addrNationality", label: "Nationality", type: "text" },
    ],
  },
];

const FAMILY_BLOCKS = [
  {
    title: "Father",
    fields: [
      { key: "fatherName", label: "Father's name", required: true, type: "text" },
      { key: "fatherAge", label: "Age", type: "text" },
      { key: "fatherEducation", label: "Education", type: "text" },
      { key: "fatherPanNo", label: "PAN No", type: "upload", note: "Card image optional — front and back" },
      { key: "fatherAadhaarNo", label: "Aadhaar No", type: "upload", note: "Card image optional — front and back" },
      {
        key: "fatherOccupation",
        label: "Occupation",
        type: "pill",
        options: ["Independent", "Business (joint / nuclear)", "Professional", "Self employed", "Industrialist", "Bureaucrat", "Private sector"],
      },
      { key: "paternalBrothers", label: "Paternal brothers", type: "text" },
      { key: "paternalSisters", label: "Paternal sisters", type: "text" },
      { key: "fatherOriginallyBelongsTo", label: "Originally belongs to", type: "text" },
      { key: "fatherLiving", label: "Living", type: "pill", options: ["Jointly", "Nuclear"] },
      { key: "fatherPhone", label: "Phone", type: "text" },
      { key: "fatherEmail", label: "E-mail", type: "text" },
      { key: "fatherBusinessDetails", label: "Business details", type: "textarea" },
      { key: "fatherCompanyAddress", label: "Company name & address", type: "textarea" },
    ],
  },
  {
    title: "Mother",
    fields: [
      { key: "motherName", label: "Mother's name", required: true, type: "text" },
      { key: "motherMaidenName", label: "Maiden name", type: "text" },
      { key: "motherAge", label: "Age", type: "text" },
      { key: "motherEducation", label: "Education", type: "text" },
      { key: "motherPanNo", label: "PAN No", type: "upload", note: "Card image optional — front and back" },
      { key: "motherAadhaarNo", label: "Aadhaar No", type: "upload", note: "Card image optional — front and back" },
      {
        key: "motherOccupation",
        label: "Occupation",
        type: "pill",
        options: ["Independent", "Business (joint / nuclear)", "Professional", "Self employed", "Industrialist", "Bureaucrat", "Private sector", "House wife"],
      },
      { key: "maternalBrothers", label: "Maternal brothers", type: "text" },
      { key: "maternalSisters", label: "Maternal sisters", type: "text" },
      { key: "motherOriginallyBelongsTo", label: "Originally belongs to", type: "text" },
      { key: "motherPhone", label: "Phone", type: "text" },
      { key: "motherEmail", label: "E-mail", type: "text" },
      { key: "motherBusinessDetails", label: "Business details", type: "textarea" },
      { key: "motherCompanyAddress", label: "Company name & address", type: "textarea" },
    ],
  },
  {
    title: "Grandparents & family standing",
    fields: [
      { key: "grandfatherName", label: "Grandfather's name", type: "text" },
      { key: "grandmotherName", label: "Grandmother's name", type: "text" },
      { key: "familyType", label: "Family type", type: "pill", options: ["Joint", "Nuclear", "Extended"] },
      { key: "familyStatus", label: "Family status", type: "text" },
      { key: "nativeLocation", label: "Native location", type: "text" },
      { key: "roleInFamily", label: "Role in family", type: "pill", options: ["Eldest", "Middle", "Youngest", "Only child"] },
      { key: "grandfatherDetails", label: "Grandfather's details", type: "textarea" },
      { key: "grandmotherDetails", label: "Grandmother's details", type: "textarea" },
      { key: "familyHistory", label: "Family history", type: "textarea" },
      { key: "familyExpectations", label: "Family expectations from the match", type: "textarea" },
    ],
  },
];

const SIBLING_ROW_FIELDS = [
  { key: "name", label: "Name" },
  { key: "relation", label: "Relation" },
  { key: "age", label: "Age" },
  { key: "personalDetails", label: "Personal details" },
  { key: "maritalStatus", label: "Marital status" },
  { key: "spouseDetails", label: "Spouse's details" },
];

const SIBLINGS_BLOCKS = [
  {
    title: "Siblings",
    fields: [
      { key: "numberOfSiblings", label: "Number of siblings", type: "text" },
      { key: "brothers", label: "Brothers", type: "text" },
      { key: "sisters", label: "Sisters", type: "text" },
      { key: "marriedSiblings", label: "Married siblings", type: "text" },
      {
        key: "siblingDetails",
        label: "Sibling detail",
        type: "rows",
        rowLabel: "Sibling",
        fullWidth: true,
        rowCount: 3,
        rowFields: SIBLING_ROW_FIELDS,
      },
    ],
  },
  {
    title: "Other financial details of family",
    fields: [
      { key: "turnover", label: "Turnover", type: "text", sensitive: true },
      { key: "annualFamilyIncome", label: "Annual family income", type: "text", sensitive: true },
      { key: "numberOfEmployees", label: "Number of employees", type: "text" },
      { key: "familyBudget", label: "Budget", type: "text" },
      { key: "vehicles", label: "Vehicles", type: "text" },
      { key: "countriesTravelled", label: "Countries travelled", type: "text" },
      { key: "otherPropertyDetails", label: "Other property details", type: "textarea", sensitive: true },
      { key: "yourLifestyle", label: "Your lifestyle", type: "textarea", sensitive: true },
    ],
  },
];

const MATCH_BLOCKS = [
  {
    title: "Basics",
    fields: [
      { key: "preferenceGivenBy", label: "Preference given by", required: true, type: "pill", options: ["Candidate", "Parent", "RM"] },
      { key: "desiredAgeFrom", label: "Desired age — from", required: true, type: "text" },
      { key: "desiredAgeTo", label: "Desired age — to", required: true, type: "text" },
      { key: "matchHeightFrom", label: "Height — from", required: true, type: "text" },
      { key: "matchHeightTo", label: "Height — to", required: true, type: "text" },
      { key: "preferredSectCaste", label: "Preferred sect / caste options", type: "text" },
      { key: "preferredMaritalStatus", label: "Preferred marital status", type: "pill", options: ["Single", "Divorced", "Widow / Widower", "Doesn't matter"] },
      { key: "childrenAcceptable", label: "Children acceptable", type: "pill", options: ["Without children only", "With children", "Doesn't matter"] },
      { key: "minimumEducation", label: "Minimum education", type: "pill", options: ["Under graduate", "Graduate", "Post graduate", "Doctorate", "Doesn't matter"] },
      { key: "preferredReligion", label: "Preferred religion", type: "text" },
      { key: "preferredOccupation", label: "Preferred occupation", type: "text" },
      { key: "occupationPreferenceNote", label: "Occupation preference — note", type: "text" },
      { key: "minPersonalIncome", label: "Min personal income per month", type: "text" },
    ],
  },
  {
    title: "Habits & astrology",
    fields: [
      { key: "matchDrinking", label: "Drinking habits", type: "pill", options: ["Teetotaller", "Occasional drinker", "Regular drinker", "Doesn't matter"] },
      { key: "matchSmoking", label: "Smoking acceptable", type: "pill", options: ["Non smoker", "Occasional smoker", "Regular smoker", "Doesn't matter"] },
      { key: "matchEating", label: "Eating habits", type: "pill", options: ["Vegetarian", "Eggetarian", "Non vegetarian", "Doesn't matter"] },
      { key: "matchManglik", label: "Astrologically the match should be", type: "pill", options: ["Non manglik", "Manglik only", "Slightly manglik", "Doesn't matter"] },
    ],
  },
  {
    title: "Location & expectations",
    fields: [
      { key: "openOutOfIndia", label: "Open for out of India", type: "pill", options: ["Yes", "No"] },
      { key: "outOfIndiaSpecify", label: "Out of India — specify", type: "text" },
      { key: "openOutOfCity", label: "Open for out of city", type: "pill", options: ["Yes", "No"] },
      { key: "outOfCitySpecify", label: "Out of city — specify", type: "text" },
      { key: "partnerExpectations", label: "Expectations from your life partner / family", type: "textarea" },
    ],
  },
  {
    title: "Zone, visa & other criteria",
    fields: [
      { key: "matchPreferredZone", label: "Preferred zone", type: "pill", options: ["Delhi NCR", "Gurgaon", "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Doesn't matter"] },
      { key: "matchPreferredCountry", label: "Preferred country", type: "text" },
      { key: "matchPreferredState", label: "Preferred state", type: "text" },
      { key: "matchPreferredCity", label: "Preferred city", type: "text" },
      { key: "matchResidentialPreference", label: "Residential preference", type: "pill", options: ["Indian citizen", "Temporarily abroad", "NRI", "Foreigner", "Doesn't matter"] },
      { key: "visaStatusExpected", label: "Visa status expected", type: "text" },
      { key: "appearancePreference", label: "Appearance preference", type: "text" },
      { key: "marriageBudgetFromPartner", label: "Marriage budget expected from partner side", type: "text" },
      { key: "preferencesRelaxedAfterRejection", label: "Preferences relaxed after a rejection", type: "pill", options: ["Yes", "No"] },
      { key: "rmCustomInsights", label: "RM custom insights (comma separated)", type: "textarea" },
      { key: "whatWasRelaxed", label: "What was relaxed, and why", type: "textarea" },
    ],
  },
];

const ESSENTIAL_BLOCKS = [
  {
    title: "Work",
    fields: [
      { key: "workRemoteOrFixed", label: "Work is remote or fixed", type: "pill", options: ["Remote", "Fixed", "Hybrid"] },
      { key: "interCityTransfers", label: "Inter-city or inter-country transfers", type: "pill", options: ["Yes", "No"] },
      { key: "careerGoals", label: "Career goals", type: "textarea" },
      { key: "partnerCareerExpectations", label: "Expectations from partner's career", type: "textarea" },
    ],
  },
  {
    title: "Family",
    fields: [
      { key: "wantChildren", label: "Do you want children", type: "pill", options: ["Yes", "No"] },
      { key: "nuclearOrJointFamily", label: "Nuclear or joint family", type: "pill", options: ["Nuclear", "Joint family"] },
      { key: "havePets", label: "Do you have pets", type: "pill", options: ["Yes", "No"] },
      { key: "comfortableWithPets", label: "Comfortable living with pets", type: "pill", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Social",
    fields: [
      { key: "socialMediaActivity", label: "Social media activity", type: "pill", options: ["Not active", "Moderately active", "Very active"] },
      { key: "travelPreference", label: "Travel preference", type: "pill", options: ["Alone", "With family", "In big groups"] },
      { key: "callYourselfSociable", label: "Would you call yourself sociable", type: "textarea" },
      { key: "socialExpectationsFromPartner", label: "Social expectations from partner", type: "textarea" },
    ],
  },
  {
    title: "Wellbeing in a matrimonial context",
    fields: [
      { key: "wellbeingPhysicalHealth", label: "Physical health", type: "textarea" },
      { key: "wellbeingMentalHealth", label: "Mental health", type: "textarea" },
      { key: "wellbeingWorkLifeBalance", label: "Work-life balance", type: "textarea" },
      { key: "wellbeingEmotionalIntelligence", label: "Emotional intelligence", type: "textarea" },
      { key: "wellbeingPhysicalFitness", label: "Physical fitness", type: "textarea" },
      { key: "wellbeingDietNutrition", label: "Diet and nutrition", type: "textarea" },
      { key: "wellbeingGoalsAspirations", label: "Goals and aspirations", type: "textarea" },
    ],
  },
];

const MEDICAL_BLOCKS = [
  {
    title: "Candidate's medical history",
    fields: [
      { key: "preExistingConditions", label: "Pre-existing medical conditions", type: "pill", options: ["Yes", "No"] },
      { key: "preExistingSpecify", label: "If yes, specify", type: "text" },
      { key: "majorSurgeries", label: "Major surgeries or treatment", type: "pill", options: ["Yes", "No"] },
      { key: "surgeryDetails", label: "Surgery details", type: "text" },
      { key: "geneticHereditaryConditions", label: "Genetic or hereditary conditions", type: "pill", options: ["Yes", "No"] },
      { key: "candidateConditionSpecified", label: "Condition specified", type: "text" },
      { key: "longTermMedication", label: "Long-term medication", type: "pill", options: ["Yes", "No"] },
      { key: "medicationDetails", label: "Medication details", type: "text" },
      { key: "physicalDisability", label: "Physical disability or impairment", type: "pill", options: ["Yes", "No"] },
      { key: "candidateConditionDetails", label: "Condition details", type: "text" },
    ],
  },
  {
    title: "Family's medical history",
    fields: [
      { key: "familyHereditaryConditions", label: "Hereditary conditions in the family", type: "pill", options: ["Yes", "No"] },
      { key: "familyConditionSpecified", label: "Family condition specified", type: "text" },
      { key: "familyMajorIllness", label: "Major illness in the family", type: "pill", options: ["Yes", "No"] },
      { key: "familyIllnessDetails", label: "Illness details", type: "text" },
      { key: "familyGeneticDisorders", label: "Family history of genetic disorders", type: "pill", options: ["Yes", "No"] },
      { key: "familyDisorderDetails", label: "Disorder details", type: "text" },
      { key: "familyPsychiatricBipolar", label: "Psychiatric illness — bipolar", type: "pill", options: ["Yes", "No"] },
      { key: "familyOtherPsychiatricHistory", label: "Other psychiatric history", type: "text" },
    ],
  },
  {
    title: "Optional & consent",
    fields: [
      { key: "dietaryRestrictionsMedical", label: "Dietary restrictions (medical)", type: "text" },
      { key: "knownAllergies", label: "Known allergies", type: "text" },
      { key: "consentToUseForMatchmaking", label: "Consent to use for matchmaking", required: true, type: "pill", options: ["Given", "Not given"] },
    ],
  },
];

const DECLARATION_BLOCKS = [
  {
    title: "Declaration",
    fields: [
      { key: "declaredBy", label: "Declared by", required: true, type: "text" },
      { key: "relationToCandidate", label: "Relation to candidate", required: true, type: "text" },
      { key: "registrationAmountAgreed", label: "Registration amount agreed", required: true, type: "text" },
      { key: "rokaSuccessFeeAgreed", label: "Roka / success fee agreed", required: true, type: "text" },
      { key: "declarationDate", label: "Date", required: true, type: "text" },
      { key: "declarationPlace", label: "Place", required: true, type: "text" },
      { key: "signatureMode", label: "Signature", type: "pill", options: ["Taken on paper", "e-Signed by OTP"] },
      { key: "termsAccepted", label: "Terms & conditions accepted (19 clauses)", required: true, type: "pill", options: ["Accepted", "Pending"] },
    ],
  },
  {
    title: "Dispatch & handling",
    fields: [
      { key: "dispatchMode", label: "Dispatch mode", type: "pill", options: ["By courier", "By e-mail", "By post", "By phone", "By fax", "Personal collection"] },
      { key: "filledBy", label: "Filled by", type: "text" },
      { key: "whoMet", label: "Who met", type: "text" },
      { key: "placeOfMeeting", label: "Place of meeting", type: "text" },
      { key: "additionalServices", label: "Additional services", type: "textarea" },
    ],
  },
  {
    title: "Check list",
    fields: [
      {
        key: "documentsCollected",
        label: "Documents collected",
        type: "checklist",
        options: [
          "Format complete",
          "Proof of date of birth",
          "Proof of I.D.",
          "Photograph",
          "Visiting cards (2)",
          "Business profile",
          "Self made profile",
          "Divorce decree (if divorced)",
          "Passport copy (NRI / abroad / non-Indian)",
          "Report of medical test",
        ],
      },
    ],
  },
];

const VISIBILITY_OPTIONS = ["Hidden", "RM only", "Shortlisted only", "All viewers"];

const COMMUNICATION_BLOCKS = [
  {
    title: "How to reach the client",
    fields: [
      { key: "preferredChannel", label: "Preferred channel", type: "pill", options: ["WhatsApp", "Phone call", "E-mail", "SMS", "In-app"] },
      { key: "callBetweenFrom", label: "Call between — from", type: "text" },
      { key: "callBetweenTo", label: "Call between — to", type: "text" },
      { key: "preferredLanguage", label: "Preferred language", type: "pill", options: ["Hindi", "English", "Punjabi", "Other"] },
      { key: "doNotDisturb", label: "Do not disturb", type: "pill", options: ["On", "Off"] },
      { key: "smsOptIn", label: "SMS opt-in", type: "pill", options: ["Yes", "No"] },
      { key: "emailOptIn", label: "E-mail opt-in", type: "pill", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Consent & sign-off",
    fields: [
      { key: "dataPrivacyConsent", label: "Data privacy consent", required: true, type: "pill", options: ["Taken", "Pending"] },
      { key: "consentTakenOn", label: "Consent taken on", type: "text" },
      { key: "otpSignOff", label: "OTP sign-off", type: "pill", options: ["Done", "Pending"] },
    ],
  },
  {
    title: "What the client allows us to show",
    fields: [
      { key: "showPhoneNumber", label: "Phone number", type: "pill", options: VISIBILITY_OPTIONS },
      { key: "showAddress", label: "Address", type: "pill", options: VISIBILITY_OPTIONS },
      { key: "showPhotographs", label: "Photographs", type: "pill", options: VISIBILITY_OPTIONS },
      { key: "showIncome", label: "Income", type: "pill", options: VISIBILITY_OPTIONS },
      { key: "showKundli", label: "Kundli", type: "pill", options: VISIBILITY_OPTIONS },
      { key: "contactChangeNeedsApproval", label: "Contact or address change needs RM approval", type: "pill", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Media on file",
    fields: [
      { key: "photographsOnFile", label: "Photographs on file", type: "pill", options: ["Profile", "Full length", "Family", "Casual", "Formal"] },
      { key: "introductionVideo", label: "Introduction video", type: "pill", options: ["Recorded", "Pending", "Declined"] },
      { key: "photoVisibilityManagedBy", label: "Photo visibility managed by", type: "text" },
    ],
  },
];

const PAYMENT_ROW_FIELDS = [
  { key: "amount", label: "Amount" },
  { key: "mode", label: "Mode" },
  { key: "details", label: "Details" },
  { key: "invoiceNo", label: "Invoice no." },
  { key: "date", label: "Date" },
  { key: "creBd", label: "C.R.E./BD" },
  { key: "balance", label: "Balance" },
];

const CASE_MATURITY_ROW_FIELDS = [
  { key: "amount", label: "Amount" },
  { key: "mode", label: "Mode" },
  { key: "details", label: "Details" },
  { key: "recNo", label: "Rec. no." },
  { key: "date", label: "Date" },
  { key: "creBd", label: "C.R.E./BD" },
  { key: "balance", label: "Balance" },
];

const CASESHEET_BLOCKS = [
  {
    title: "Case sheet",
    fields: [
      { key: "caseSheetDate", label: "Date", type: "text" },
      { key: "registrationNo", label: "Registration no.", required: true, type: "text" },
      { key: "visitedBy", label: "Visited by", type: "text" },
      { key: "casePlace", label: "Place", type: "text" },
      { key: "caseReference", label: "Reference", type: "text" },
      { key: "caseCreBd", label: "C.R.E. / BD", type: "text" },
      { key: "caseInvoiceNo", label: "Invoice no.", type: "text" },
    ],
  },
  {
    title: "Payment details",
    fields: [
      {
        key: "paymentDetails",
        label: "Payment details",
        type: "rows",
        rowLabel: "Entry",
        fullWidth: true,
        rowCount: 3,
        rowFields: PAYMENT_ROW_FIELDS,
      },
    ],
  },
  {
    title: "Case maturity charges",
    fields: [
      {
        key: "caseMaturityCharges",
        label: "Case maturity charges",
        type: "rows",
        rowLabel: "Entry",
        fullWidth: true,
        rowCount: 3,
        rowFields: CASE_MATURITY_ROW_FIELDS,
      },
    ],
  },
  {
    title: "Service availed",
    fields: [
      {
        key: "servicePackage",
        label: "Package",
        required: true,
        type: "pill",
        options: ["Classic Services", "Economic Package", "Confidential Package", "Involvement Package", "Exclusive Package", "Customized Package (Ultra Premium)"],
      },
    ],
  },
];

export const SECTION_BLOCKS = {
  personal: PERSONAL_DETAILS_BLOCKS,
  education: EDUCATION_BLOCKS,
  residency: RESIDENCY_BLOCKS,
  family: FAMILY_BLOCKS,
  siblings: SIBLINGS_BLOCKS,
  match: MATCH_BLOCKS,
  essential: ESSENTIAL_BLOCKS,
  medical: MEDICAL_BLOCKS,
  declaration: DECLARATION_BLOCKS,
  communication: COMMUNICATION_BLOCKS,
  casesheet: CASESHEET_BLOCKS,
};

/** Flat map of personal-detail field key → label (for change summary / OTP diffs). */
export function getPersonalFieldLabels() {
  const labels = {};
  for (const block of PERSONAL_DETAILS_BLOCKS) {
    for (const field of block.fields) {
      labels[field.key] = field.label;
    }
  }
  return labels;
}

/** Snapshot personal field values from a full values object. */
export function snapshotPersonalValues(values = {}) {
  const snap = {};
  for (const block of PERSONAL_DETAILS_BLOCKS) {
    for (const field of block.fields) {
      snap[field.key] = values[field.key] ?? "";
    }
  }
  return snap;
}

/** Diff personal values; returns [{ key, label, from, to }]. */
export function diffPersonalValues(before = {}, after = {}) {
  const labels = getPersonalFieldLabels();
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes = [];
  for (const key of keys) {
    if (!labels[key]) continue;
    const from = before[key] == null ? "" : String(before[key]);
    const to = after[key] == null ? "" : String(after[key]);
    if (from.trim() === to.trim()) continue;
    changes.push({
      key,
      label: labels[key],
      from: from.trim() || "—",
      to: to.trim() || "—",
    });
  }
  return changes;
}

export const DEMO_PERSONAL_VALUES = {
  gender: "Female",
  firstName: "Priya",
  lastName: "Raheja",
  clientType: "Exclusive",
  profileStatus: "Under review",
  maritalStatus: "Never married",
  lookingFor: "Groom",
  enquiryBy: "Parent",
  panNo: "AHXPR••••K",
  aadhaarNo: "•••• •••• 4417",
  aadhaarFiles: ["aadhaar-front.jpg", "aadhaar-back.jpg"],
  mobile: "98••• ••164",
  email: "priya.raheja@gmail.com",
  dob: "14 Jul 1995",
  timeOfBirth: "04:20",
  placeOfBirth: "Delhi",
  nativePlace: "Hisar, Haryana",
  zodiacSign: "Cancer",
  gotra: "Garg",
  manglik: "Non Manglik",
  religion: "Hindu",
  sectCaste: "Agarwal",
  motherTongue: "Hindi",
  height: "5 ft 4 in / 163 cms",
  weight: "56",
  bloodGroup: "B+",
  complexion: "Fair",
  spectacles: "Yes",
  leftEyePower: "-1.25",
  rightEyePower: "-1.00",
  disability: "No",
  drinking: "Teetotaller",
  smoking: "Non smoker",
  eating: "Vegetarian",
};

const DEMO_EDUCATION_VALUES = {
  hobbies: "Classical music, trekking, baking",
  languagesKnown: "Hindi, English, Punjabi",
  distinctAchievements: "AIR 41 in CA finals",
  courses: [
    { level: "Professional", course: "CA — 4 yrs", stream: "Audit & taxation", institution: "ICAI", year: "2019", pct: "AIR 214" },
    { level: "Graduation", course: "B.Com (H) — 3 yrs", stream: "Commerce", institution: "SRCC, Delhi University", year: "2016", pct: "8.4 CGPA" },
    { level: "12th", course: "Class XII", stream: "Commerce", institution: "DPS R.K. Puram", year: "2013", pct: "94.2%" },
    {},
  ],
  occupation: "Professional",
  designation: "Manager — Audit",
  workingSince: "Jul 2019",
  personalAnnualIncome: "₹18–24L p.a.",
  organisationSpec: "Sharma & Associates, Gurugram — statutory audit, mid-size firm",
  currentlyReside: "Parental house",
  householdType: "Joint house",
  stayingSince: "2011",
  residenceContact: "98••• ••164",
  currentAddress: "House 214, Sector 43, Gurugram, Haryana 122009",
};

const DEMO_RESIDENCY_VALUES = {
  residentialStatus: "Indian",
};

const DEMO_FAMILY_VALUES = {
  fatherName: "Rajesh Raheja",
  fatherAge: "62",
  fatherEducation: "B.Com",
  fatherOccupation: "Business (joint / nuclear)",
  paternalBrothers: "2",
  paternalSisters: "1",
  fatherOriginallyBelongsTo: "Hisar, Haryana",
  fatherLiving: "Jointly",
  fatherPhone: "98••• ••771",
  fatherBusinessDetails: "Raheja Textiles — textile trading, 28 years",
  fatherCompanyAddress: "Raheja Textiles, 41 Katra Neel, Chandni Chowk, Delhi",
  motherName: "Sunita Raheja",
  motherMaidenName: "Sunita Bansal",
  motherAge: "57",
  motherEducation: "B.A.",
  motherOccupation: "House wife",
  motherOriginallyBelongsTo: "Delhi",
  motherPhone: "98••• ••902",
};

const DEMO_SIBLINGS_VALUES = {
  numberOfSiblings: "1",
  brothers: "0",
  sisters: "1",
  siblingDetails: [
    {
      name: "Ankita Raheja",
      relation: "Sister",
      age: "34",
      personalDetails: "Architect, own practice in Delhi",
      maritalStatus: "Married",
      spouseDetails: "Doctor — orthopaedic, Sir Ganga Ram",
    },
    {},
    {},
  ],
  turnover: "₹6–8 Cr",
  annualFamilyIncome: "₹25–50L p.a.",
  numberOfEmployees: "24",
  familyBudget: "₹60–80L",
  vehicles: "Fortuner, Baleno",
  countriesTravelled: "9",
  otherPropertyDetails: "Plot in Hisar (approx. 300 sq yd), shop at Chandni Chowk",
  yourLifestyle: "Owned 500 sq yd house in Sector 43, understated, travels twice a year",
};

const DEMO_MATCH_VALUES = {
  desiredAgeFrom: "30",
  desiredAgeTo: "35",
  matchHeightFrom: "5 ft 8 in",
  matchHeightTo: "6 ft 1 in",
  preferredSectCaste: "Agarwal, Bansal, Goyal, Mittal",
  preferredMaritalStatus: "Single",
  childrenAcceptable: "Without children only",
  minimumEducation: "Post graduate",
  preferredOccupation: "CA, doctor, senior corporate",
  minPersonalIncome: "₹2L",
  matchDrinking: "Occasional drinker",
  matchSmoking: "Non smoker",
  matchEating: "Vegetarian",
  matchManglik: "Doesn't matter",
  openOutOfIndia: "No",
  openOutOfCity: "Yes",
  outOfCitySpecify: "Delhi NCR, Mumbai",
  partnerExpectations: "Settled, travels, no rigid roles at home. A joint household of more than four is a deal-breaker.",
};

const DEMO_ESSENTIAL_VALUES = {
  workRemoteOrFixed: "Hybrid",
  interCityTransfers: "No",
  careerGoals: "Partner track in four to five years",
  partnerCareerExpectations: "Should be settled, no preference on sector",
  wantChildren: "Yes",
  nuclearOrJointFamily: "Nuclear",
  havePets: "No",
  comfortableWithPets: "Yes",
  socialMediaActivity: "Moderately active",
  travelPreference: "With family",
  callYourselfSociable: "Selective — small circle",
  wellbeingWorkLifeBalance: "Long audit seasons, protective of weekends",
  wellbeingPhysicalFitness: "Yoga four days a week",
  wellbeingGoalsAspirations: "Partner track, wants to travel more",
};

const DEMO_MEDICAL_VALUES = {
  preExistingConditions: "No",
  majorSurgeries: "No",
  geneticHereditaryConditions: "No",
  longTermMedication: "Yes",
  medicationDetails: "Thyroid — since 2021",
  physicalDisability: "No",
  familyHereditaryConditions: "Yes",
  familyConditionSpecified: "Diabetes — father",
  familyGeneticDisorders: "No",
  familyPsychiatricBipolar: "No",
  dietaryRestrictionsMedical: "Low iodine",
  knownAllergies: "Penicillin",
  consentToUseForMatchmaking: "Given",
};

const DEMO_DECLARATION_VALUES = {
  declaredBy: "Rajesh Raheja",
  relationToCandidate: "Father",
  registrationAmountAgreed: "₹53,100",
  rokaSuccessFeeAgreed: "₹1,11,000",
  declarationDate: "02 Aug 2026",
  declarationPlace: "New Delhi",
  signatureMode: "e-Signed by OTP",
  termsAccepted: "Accepted",
  dispatchMode: "By e-mail",
  filledBy: "Neha Sharma",
  whoMet: "Neha Sharma",
  placeOfMeeting: "Client residence, Sector 43",
  documentsCollected: ["Format complete", "Proof of date of birth", "Proof of I.D.", "Photograph"],
};

const DEMO_CASESHEET_VALUES = {
  caseSheetDate: "02 Aug 2026",
  registrationNo: "SE/26/0631",
  visitedBy: "Neha Sharma",
  casePlace: "Gurugram",
  caseReference: "Existing client MML-C-0388",
  caseCreBd: "Neha Sharma / Komal Mehra",
  caseInvoiceNo: "MML/26-27/0412",
  paymentDetails: [
    {
      amount: "₹31,860",
      mode: "UPI",
      details: "Registration — part 1",
      invoiceNo: "MML/26-27/0412",
      date: "02 Aug 2026",
      creBd: "Neha Sharma",
      balance: "₹21,240",
    },
    {},
    {},
  ],
  servicePackage: "Exclusive Package",
};

export const SECTION_DEMO_VALUES = {
  ...DEMO_PERSONAL_VALUES,
  ...DEMO_EDUCATION_VALUES,
  ...DEMO_RESIDENCY_VALUES,
  ...DEMO_FAMILY_VALUES,
  ...DEMO_SIBLINGS_VALUES,
  ...DEMO_MATCH_VALUES,
  ...DEMO_ESSENTIAL_VALUES,
  ...DEMO_MEDICAL_VALUES,
  ...DEMO_DECLARATION_VALUES,
  ...DEMO_CASESHEET_VALUES,
};

export const INPUT =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17] bg-white";

export function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value && String(value).trim());
}

export function isRowsFilled(rows) {
  return Array.isArray(rows) && rows.some((r) => Object.values(r || {}).some((v) => v && String(v).trim()));
}

export function isFieldFilled(field, values, chipValues) {
  if (field.type === "rows") return isRowsFilled(values[field.key]);
  if (field.type === "checklist") return Array.isArray(values[field.key]) && values[field.key].length > 0;
  if (field.chipsKey) {
    if (isFilled(values[field.key])) return true;
    return (chipValues?.[field.chipsKey]?.length || 0) > 0;
  }
  return isFilled(values[field.key]);
}

/** Filled row objects for client-record detail tables. */
export function getFilledRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((r) => Object.values(r || {}).some((v) => v && String(v).trim()));
}

/** Detail tables shown below section summary cards on Client record. */
export const RECORD_DETAIL_TABLES = [
  { key: "paymentDetails", title: "Payment details", columns: PAYMENT_ROW_FIELDS },
  { key: "caseMaturityCharges", title: "Case maturity charges", columns: CASE_MATURITY_ROW_FIELDS },
  { key: "courses", title: "Educational qualifications", columns: QUALIFICATION_ROW_FIELDS, asTable: true },
  { key: "siblingDetails", title: "Sibling detail", columns: SIBLING_ROW_FIELDS },
];

export function computeSectionPercent(blocks, values, chipValues) {
  const total = blocks.reduce((sum, b) => sum + b.fields.length, 0);
  const filled = blocks.reduce((sum, b) => sum + b.fields.filter((f) => isFieldFilled(f, values, chipValues)).length, 0);
  return total ? Math.round((filled / total) * 100) : 0;
}

export function countSectionFields(blocks, values, chipValues) {
  if (!blocks?.length) return { filled: 0, total: 0 };
  const total = blocks.reduce((sum, b) => sum + b.fields.length, 0);
  const filled = blocks.reduce((sum, b) => sum + b.fields.filter((f) => isFieldFilled(f, values, chipValues)).length, 0);
  return { filled, total };
}

export const SECTION_TIPS = {
  personal:
    "Ask like this: Profile ID and date fill in on save. Read the name back to the client before moving on.",
  education:
    "Ask like this: Most recent qualification first. Income can be a band — write what the client actually says.",
  residency:
    "Ask like this: Confirm current city first, then previous addresses. Note any visa or NRI details clearly.",
  family:
    "Ask like this: Capture father and mother details separately. Note occupation and living status carefully.",
  siblings:
    "Ask like this: List siblings in birth order. Note marital status and whether they stay in the same city.",
  match:
    "Ask like this: Start with must-haves, then nice-to-haves. Confirm flexibility on caste, city and age.",
  essential:
    "Ask like this: These answers affect match quality — pause and confirm each one with the client.",
  medical:
    "Ask like this: Be sensitive. Record what the client discloses; do not probe beyond what they share.",
  declaration:
    "Ask like this: Read each checklist item aloud and tick only after the client confirms.",
  communication:
    "Ask like this: Confirm preferred contact channel and who can receive updates about this profile.",
  casesheet:
    "Ask like this: Official-use notes only. Keep them factual and dated.",
};

