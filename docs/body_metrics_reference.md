# Documentación de Métricas Corporales

## Tipos de Medición (`measurement_type`)

La tabla `body_measurements` utiliza un esquema flexible. A continuación se detallan los tipos estándar utilizados por el frontend:

### Medidas Antropométricas (Unit: `cm`)
-   `CHEST`: Circunferencia del pecho.
-   `WAIST`: Circunferencia de la cintura.
-   `HIPS`: Circunferencia de las caderas.
-   `THIGH`: Circunferencia del muslo.
-   `HEIGHT`: Altura total (usada para cálculo de BMI).

### Salud Metabólica
-   `GLUCOSE` (Unit: `mg/dL`): Nivel de glucosa en sangre.
-   `KETONES` (Unit: `mmol/L`): Cuerpos cetónicos (futuro).

### Cardiovascular (Unit: `mmHg`)
-   `BLOOD_PRESSURE_SYSTOLIC`: Presión arterial sistólica (valor alto).
-   `BLOOD_PRESSURE_DIASTOLIC`: Presión arterial diastólica (valor bajo).

## Notas de Implementación
-   **Presión Arterial**: Se almacenan como dos registros independientes con el mismo timestamp (aproximado). El frontend es responsable de agruparlos por fecha/hora para visualizarlos juntos.
