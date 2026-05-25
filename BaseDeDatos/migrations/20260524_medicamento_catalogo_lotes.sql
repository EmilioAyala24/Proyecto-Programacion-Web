ALTER TABLE lote
  ADD COLUMN IF NOT EXISTS id_med INTEGER;

ALTER TABLE medicamento
  ALTER COLUMN id_lote DROP NOT NULL;

UPDATE lote l
SET id_med = m.id_med
FROM medicamento m
WHERE m.id_lote = l.id_lote
  AND l.id_med IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_lote_med'
  ) THEN
    ALTER TABLE lote
      ADD CONSTRAINT fk_lote_med FOREIGN KEY (id_med) REFERENCES medicamento(id_med);
  END IF;
END $$;
