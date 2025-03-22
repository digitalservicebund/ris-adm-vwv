-- View uses foreign schema "lookup_tables", therefore it is repeatable.
-- This migration is executed every time this script is changed.

CREATE OR REPLACE VIEW field_of_law_view AS
SELECT id, identifier, "text", juris_id, "notation"
FROM lookup_tables.field_of_law;

CREATE OR REPLACE VIEW field_of_law_field_of_law_parent_view AS
SELECT field_of_law_id,
       field_of_law_parent_id
FROM lookup_tables.field_of_law_field_of_law_parent;

CREATE OR REPLACE VIEW field_of_law_norm_view AS
SELECT id,
       abbreviation,
       single_norm_description,
       field_of_law_id
FROM lookup_tables.field_of_law_norm;
