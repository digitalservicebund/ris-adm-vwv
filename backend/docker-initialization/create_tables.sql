set role lookup_tables;

CREATE TABLE
IF NOT EXISTS
lookup_tables.document_types (
    id uuid not null,
    abbreviation character varying(255),
    name character varying(255),
    constraint document_types_pkey primary key (id)
);

INSERT INTO lookup_tables.document_types VALUES ('b678b77b-ffc4-4756-825d-a4376b985b0d', 'VE', 'Verwaltungsvereinbarung');
INSERT INTO lookup_tables.document_types VALUES ('8de5e4a0-6b67-4d65-98db-efe877a260c4', 'VR', 'Verwaltungsregelung');

CREATE TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law
(
    id         uuid          NOT NULL,
    identifier varchar(255)  NOT NULL,
    "text"     varchar(1000) NOT NULL,
    juris_id   int4          NOT NULL,
    "notation" varchar(255)  NOT NULL,
    CONSTRAINT field_of_law_identifier_key UNIQUE (identifier),
    CONSTRAINT field_of_law_juris_id_notation_key UNIQUE (juris_id, "notation"),
    CONSTRAINT field_of_law_pkey PRIMARY KEY (id)
);


CREATE TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_field_of_law_parent
(
    field_of_law_id        UUID NOT NULL
        CONSTRAINT field_of_law_field_of_law_parent_pkey PRIMARY KEY
        CONSTRAINT field_of_law_fkey REFERENCES field_of_law,
    field_of_law_parent_id UUID NOT NULL
        CONSTRAINT field_of_law_parent_fkey REFERENCES field_of_law
);

CREATE
    INDEX ON
    lookup_tables.field_of_law_field_of_law_parent (field_of_law_parent_id);

CREATE TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_field_of_law_text_reference
(
    field_of_law_id                UUID NOT NULL
        CONSTRAINT field_of_law_fkey REFERENCES field_of_law,
    field_of_law_text_reference_id UUID NOT NULL
        CONSTRAINT field_of_law_text_reference_fkey REFERENCES field_of_law,
    CONSTRAINT field_of_law_field_of_law_text_reference_pkey PRIMARY KEY (
      field_of_law_id,
      field_of_law_text_reference_id
    )
);

CREATE
    INDEX ON
    lookup_tables.field_of_law_field_of_law_text_reference (field_of_law_text_reference_id);

CREATE TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_keyword
(
    id    UUID         NOT NULL
        CONSTRAINT field_of_law_keyword_pkey PRIMARY KEY,
    value VARCHAR(255) NOT NULL
        CONSTRAINT field_of_law_keyword_key UNIQUE
);

CREATE TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_field_of_law_keyword
(
    field_of_law_id         UUID NOT NULL
        CONSTRAINT field_of_law_fkey REFERENCES field_of_law,
    field_of_law_keyword_id UUID NOT NULL
        CONSTRAINT field_of_law_keyword_fkey REFERENCES field_of_law_keyword,
    CONSTRAINT field_of_law_field_of_law_keyword_pkey PRIMARY KEY (
       field_of_law_id,
       field_of_law_keyword_id
    )
);

CREATE
    INDEX ON
    lookup_tables.field_of_law_field_of_law_keyword (field_of_law_keyword_id);

CREATE
    TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_navigation_term
(
    id    UUID         NOT NULL
        CONSTRAINT field_of_law_navigation_term_pkey PRIMARY KEY,
    value VARCHAR(255) NOT NULL
        CONSTRAINT field_of_law_navigation_term_key UNIQUE
);

CREATE
    TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_field_of_law_navigation_term
(
    field_of_law_id                 UUID NOT NULL
        CONSTRAINT field_of_law_fkey REFERENCES field_of_law,
    field_of_law_navigation_term_id UUID NOT NULL
        CONSTRAINT field_of_law_navigation_term_fkey REFERENCES field_of_law_navigation_term,
    CONSTRAINT field_of_law_field_of_law_navigation_term_pkey PRIMARY KEY (
                                                                           field_of_law_id,
                                                                           field_of_law_navigation_term_id
        )
);

CREATE
    INDEX ON
    lookup_tables.field_of_law_field_of_law_navigation_term (field_of_law_navigation_term_id);

CREATE
    TABLE
    IF NOT EXISTS
    lookup_tables.field_of_law_norm
(
    id                      UUID         NOT NULL
        CONSTRAINT field_of_law_norm_pkey PRIMARY KEY,
    abbreviation            VARCHAR(255) NOT NULL,
    single_norm_description VARCHAR(255),
    field_of_law_id         UUID         NOT NULL
        CONSTRAINT field_of_law_fkey REFERENCES field_of_law
);

CREATE
    INDEX ON
    lookup_tables.field_of_law_norm (field_of_law_id);

INSERT INTO lookup_tables.field_of_law
(id, identifier, "text", juris_id, "notation")
VALUES('a785fb96-a45d-4d4c-8d9c-92d8a6592b22'::uuid, 'AR', 'Arbeitsrecht', 10517, 'NEW');
INSERT INTO lookup_tables.field_of_law
(id, identifier, "text", juris_id, "notation")
VALUES('b3213dee-a986-4807-9ef3-03a3ed32c45a'::uuid, 'AR-05', 'Beendigung des Arbeitsverhältnisses', 10705, 'NEW');
INSERT INTO lookup_tables.field_of_law
(id, identifier, "text", juris_id, "notation")
VALUES('9c06a4e1-02a0-4a73-b721-45ea0d98429b'::uuid, 'AR-05-01', 'Beendigungen besonderer Art, nachvertragliche Ansprüche', 10706, 'NEW');

INSERT INTO lookup_tables.field_of_law_field_of_law_parent
(field_of_law_id, field_of_law_parent_id)
VALUES('b3213dee-a986-4807-9ef3-03a3ed32c45a'::uuid, 'a785fb96-a45d-4d4c-8d9c-92d8a6592b22'::uuid);

INSERT INTO lookup_tables.field_of_law_field_of_law_parent
(field_of_law_id, field_of_law_parent_id)
VALUES('9c06a4e1-02a0-4a73-b721-45ea0d98429b'::uuid, 'b3213dee-a986-4807-9ef3-03a3ed32c45a'::uuid);

INSERT INTO lookup_tables.field_of_law_norm
(id, abbreviation, single_norm_description, field_of_law_id)
VALUES('d74ab1e8-3ebe-4571-98b7-852e3b07e3c1'::uuid, 'AStG', '§ 17', 'b3213dee-a986-4807-9ef3-03a3ed32c45a'::uuid);

set role test;
