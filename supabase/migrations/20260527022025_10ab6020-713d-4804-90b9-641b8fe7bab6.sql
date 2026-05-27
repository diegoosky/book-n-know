DROP POLICY "Cualquiera puede crear reservas" ON public.reservas;
CREATE POLICY "Cualquiera puede crear reservas" ON public.reservas
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(nombre)) BETWEEN 2 AND 100
  AND length(trim(email)) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(servicio)) BETWEEN 2 AND 100
  AND fecha >= CURRENT_DATE
  AND length(trim(hora)) BETWEEN 3 AND 10
  AND (notas IS NULL OR length(notas) <= 500)
  AND (rut IS NULL OR length(rut) <= 20)
);