-- Insert a test documentation unit xml. This file is only used in Spring Boot Profile "default".
-- This inserts 100 documentation units for e2e tests to check on the search pagination
WITH created as (
    INSERT INTO documentation_unit (id, document_number, xml)
        SELECT gen_random_uuid(),
               'KSNR' || s.running_number::text,
               '<?xml version="1.0" encoding="UTF-8"?>
        <akn:akomaNtoso xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0"
          xmlns:ris="http://ldml.neuris.de/metadata/">
          <akn:doc name="offene-struktur">
            <akn:meta>
              <akn:identification source="attributsemantik-noch-undefiniert">
                <!-- omitted -->
              </akn:identification>
              <akn:classification source="attributsemantik-noch-undefiniert">
                <akn:keyword showAs="Schlag" dictionary="attributsemantik-noch-undefiniert" value="Schlag"/>
                <akn:keyword showAs="Wort" dictionary="attributsemantik-noch-undefiniert" value="Wort"/>
                <akn:keyword showAs="Mehrere Wörter in einem Schlagwort" dictionary="attributsemantik-noch-undefiniert" value="Mehrere Wörter in einem Schlagwort"/>
              </akn:classification>
              <akn:analysis source="attributsemantik-noch-undefiniert">
                <akn:otherReferences source="attributsemantik-noch-undefiniert">
                  <akn:implicitReference shortForm="Das Periodikum" showAs="Das Periodikum 2021, Seite 15"/>
                </akn:otherReferences>
                <akn:otherReferences source="attributsemantik-noch-undefiniert">
                  <akn:implicitReference shortForm="PhanGB" showAs="PhanGB § 1a Abs 1">
                    <ris:normReference singleNorm="§ 1a Abs 1" dateOfRelevance="2011" dateOfVersion="2022-02-02"/>
                  </akn:implicitReference>
                </akn:otherReferences>
                <akn:otherReferences source="attributsemantik-noch-undefiniert">
                  <akn:implicitReference shortForm="PhanGB 5" showAs="PhanGB 5 § 2 Abs 6">
                    <ris:normReference singleNorm="§ 2 Abs 6" dateOfRelevance="2011" dateOfVersion="2022-02-02"/>
                  </akn:implicitReference>
                </akn:otherReferences>
                <akn:otherReferences source="attributsemantik-noch-undefiniert">
                  <akn:implicitReference shortForm="Vgl AG Aachen C-01/02" showAs="Vgl AG Aachen C-01/02 2021-10-20">
                    <ris:caselawReference abbreviation="Vgl" court="AG" courtLocation="Aachen" date="2021-10-20" referenceNumber="C-01/02"
                                          documentNumber="WBRE000001234"/>
                  </akn:implicitReference>
                </akn:otherReferences>
              </akn:analysis>
              <akn:proprietary source="attributsemantik-noch-undefiniert">
                <ris:metadata>
                  <ris:normgeber staat="Erste Jurpn"/>
                  <ris:normgeber staat="AA" organ="Erstes Organ"/>
                  <ris:fieldsOfLaw>
                    <ris:fieldOfLaw notation="NEW">PR-05-01</ris:fieldOfLaw>
                    <ris:fieldOfLaw notation="NEW">XX-04-02</ris:fieldOfLaw>
                    <ris:fieldOfLaw notation="OLD">01-01-01-01</ris:fieldOfLaw>
                    <ris:fieldOfLaw notation="OLD">02-02-02-02</ris:fieldOfLaw>
                  </ris:fieldsOfLaw>
                  <ris:entryIntoEffectDate>2025-01-01</ris:entryIntoEffectDate>
                  <ris:expiryDate>2025-02-02</ris:expiryDate>
                  <ris:tableOfContentsEntries>
                    <ris:tableOfContentsEntry>TOC entry 1</ris:tableOfContentsEntry>
                    <ris:tableOfContentsEntry>TOC entry 2</ris:tableOfContentsEntry>
                  </ris:tableOfContentsEntries>
                  <ris:documentType category="VR" longTitle="Bekanntmachung">VR Bekanntmachung</ris:documentType>
                  <ris:dateToQuoteList>
                    <ris:dateToQuoteEntry>2025-05-05</ris:dateToQuoteEntry>
                    <ris:dateToQuoteEntry>2025-06-01</ris:dateToQuoteEntry>
                  </ris:dateToQuoteList>
                  <ris:referenceNumbers>
                    <ris:referenceNumber>AX-Y12345</ris:referenceNumber>
                    <ris:referenceNumber>XX</ris:referenceNumber>
                  </ris:referenceNumbers>
                  <ris:activeReferences>
                    <ris:activeReference typeNumber="82" reference="PhanGB" paragraph="§ 1a" position="Abs 1"/>
                    <ris:activeReference typeNumber="82" reference="PhanGB" paragraph="§ 2" position="Abs 6"/>
                  </ris:activeReferences>
                  <ris:berufsbilder>
                    <ris:berufsbild>Brillenschleifer</ris:berufsbild>
                  </ris:berufsbilder>
                  <ris:titelAspekte>
                    <ris:titelAspekt>Gemeinsamer Bundesausschuss</ris:titelAspekt>
                    <ris:titelAspekt>GBA</ris:titelAspekt>
                  </ris:titelAspekte>
                  <ris:definitionen>
                    <ris:definition begriff="Sachgesamtheit" />
                  </ris:definitionen>
                </ris:metadata>
              </akn:proprietary>
            </akn:meta>
            <akn:preface>
              <akn:longTitle>
                <akn:block name="longTitle">1. Bekanntmachung zum XML-Testen in NeuRIS VwV</akn:block>
              </akn:longTitle>
            </akn:preface>
            <akn:mainBody>
              <akn:div>
                <akn:p>Kurzreferat Zeile 1</akn:p>
                <akn:p>Kurzreferat Zeile 2</akn:p>
              </akn:div>
            </akn:mainBody>
          </akn:doc>
        </akn:akomaNtoso>'
        FROM generate_series(999999999, 999999899, -1) AS s(running_number)
        ON conflict do nothing
        returning id as created_documentation_unit_id)
INSERT INTO documentation_unit_index (id, documentation_unit_id, langueberschrift, fundstellen, zitierdaten)
SELECT gen_random_uuid(), created.created_documentation_unit_id, '1. Bekanntmachung zum XML-Testen in NeuRIS VwV', 'Das Periodikum 2021, Seite 15', '2025-05-05$µµµµµ$2025-06-01' FROM created
ON conflict do nothing;

-- Insert specific documentation units for filtering tests

INSERT INTO documentation_unit (id, document_number, xml)
SELECT gen_random_uuid(), 'KSNR000000001', ''
WHERE NOT EXISTS (SELECT 1 FROM documentation_unit WHERE document_number = 'KSNR000000001');

INSERT INTO documentation_unit_index (id, documentation_unit_id, langueberschrift, fundstellen, zitierdaten)
SELECT
    gen_random_uuid(),
    du.id,
    'Alpha Global Setup Document',
    'BGB 123$µµµµµ$VWV xyz',
    '2024-06-17$µµµµµ$1950-01-01'
FROM documentation_unit du
WHERE du.document_number = 'KSNR000000001'
  AND NOT EXISTS (
    SELECT 1 FROM documentation_unit_index dui WHERE dui.documentation_unit_id = du.id
);


INSERT INTO documentation_unit (id, document_number, xml)
SELECT gen_random_uuid(), 'KSNR000000002', ''
WHERE NOT EXISTS (SELECT 1 FROM documentation_unit WHERE document_number = 'KSNR000000002');

INSERT INTO documentation_unit_index (id, documentation_unit_id, langueberschrift, fundstellen, zitierdaten)
SELECT
    gen_random_uuid(),
    du.id,
    'Beta Global Setup Document',
    'BGB 456',
    '2024-06-18'
FROM documentation_unit du
WHERE du.document_number = 'KSNR000000002'
  AND NOT EXISTS (
    SELECT 1 FROM documentation_unit_index dui WHERE dui.documentation_unit_id = du.id
);
