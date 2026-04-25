-- Renomear os 3 contatos de WhatsApp pelos numeros conhecidos.
-- Numeros sao normalizados (so digitos) e podem estar com ou sem o "55" do pais.

-- (11) 94456-6558 -> Bruna
UPDATE whatsapp_contacts
SET label = 'Bruna'
WHERE regexp_replace(number, '\D', '', 'g') IN ('11944566558', '5511944566558');

-- (81) 97102-0185 -> Flavia
UPDATE whatsapp_contacts
SET label = 'Flavia'
WHERE regexp_replace(number, '\D', '', 'g') IN ('81971020185', '5581971020185');

-- (62) 99689-3934 -> Rafaela
UPDATE whatsapp_contacts
SET label = 'Rafaela'
WHERE regexp_replace(number, '\D', '', 'g') IN ('62996893934', '5562996893934');

SELECT label, number, active FROM whatsapp_contacts ORDER BY label;
