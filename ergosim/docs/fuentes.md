# ErgoSim · Fuentes de los métodos RULA, REBA y ROSA

**Fecha de consulta de todas las fuentes en línea: 19 de noviembre de 2026.**

Este documento recoge, tabla por tabla, de dónde sale cada dato que usa ErgoSim. La regla es simple:
ningún valor se usa si no está aquí con su fuente. Lo que no se pudo verificar queda marcado como
**PENDIENTE DE VERIFICAR**.

## 0. Fuentes consultadas

| Clave | Fuente | Acceso | Qué se tomó |
|---|---|---|---|
| **[ERG-RULA]** | Diego-Mas, J. A. (2025). *Evaluación postural mediante el método RULA*. Ergonautas, UPV. https://www.ergonautas.upv.es/metodos/rula/rula-ayuda.php | Texto completo | Factores, modificadores, tablas A, B y C (tablas 1–18) |
| **[ERG-REBA]** | Diego-Mas, J. A. (2025). *Evaluación postural mediante el método REBA*. Ergonautas, UPV. https://www.ergonautas.upv.es/metodos/reba/reba-ayuda.php | Texto completo | Factores, modificadores, tablas A, B y C (tablas 1–20) |
| **[ERG-ROSA]** | Diego-Mas, J. A. (2025). *Evaluación de puestos de oficina mediante el método ROSA*. Ergonautas, UPV. https://www.ergonautas.upv.es/metodos/rosa/rosa-ayuda.php | Texto completo | Factores, tablas A–E, niveles de actuación |
| **[NTP1173]** | INSST (2022). *NTP 1173: Modelo para la evaluación de puestos de trabajo en oficina: método ROSA*. Álvarez Valdivia, A. y Sánchez Fuentes, M. https://www.insst.es/documentacion/colecciones-tecnicas/ntp-notas-tecnicas-de-prevencion/35-serie-ntp-numeros-1169-a-1175-ano-2022/ntp-1173-modelo-para-la-evaluacion-de-puestos-de-trabajo-en-oficina-metodo-rosa-2022 | PDF completo | Tablas A-1…A-4, B-1, B-2, C-1, C-2, A–F, ejemplo resuelto |
| **[NTP601]** | INSST (2001, corr. 2003). *NTP 601: Evaluación de las condiciones de trabajo: carga postural. Método REBA*. Nogareda Cuixart, S. https://www.insst.es/documents/94886/7861730/ntp_601.pdf | PDF completo | Factores, tablas A, B, C, niveles, ejemplo resuelto |
| **[SONNE]** | Sonne, M., Villalta, D. L. y Andrews, D. M. (2012). Development and evaluation of an office ergonomic risk checklist: ROSA – Rapid office strain assessment. *Applied Ergonomics, 43*(1), 98–108. https://doi.org/10.1016/j.apergo.2011.03.008 | **Artículo original, texto completo** (tablas 1–3, figuras 1–3) | Factores, gráficas de puntuación, ejemplo resuelto, nivel de acción |
| **[MCA-RULA]** | McAtamney, L. y Corlett, E. N. (1993). RULA: a survey method for the investigation of work-related upper limb disorders. *Applied Ergonomics, 24*(2), 91–99. https://doi.org/10.1016/0003-6870(93)90080-S | **No se pudo leer el texto completo (de pago)** | Se contrastó mediante [HEDGE-RULA] y [CORNELL], que lo citan |
| **[HIG-REBA]** | Hignett, S. y McAtamney, L. (2000). Rapid Entire Body Assessment (REBA). *Applied Ergonomics, 31*(2), 201–205. https://doi.org/10.1016/S0003-6870(99)00039-3 | **No se pudo leer el texto completo (de pago)** | Se contrastó mediante [NTP601] (adaptación del original) y [HEDGE-REBA] |
| **[HEDGE-RULA]** | Hedge, A. / Ergonomics Plus. *RULA Employee Assessment Worksheet*, basada en McAtamney y Corlett (1993). https://ergo-plus.com/wp-content/uploads/RULA.pdf | PDF | Tablas A, B, C (verificación cruzada) |
| **[HEDGE-REBA]** | Hedge, A. / Ergonomics Plus. *REBA Employee Assessment Worksheet*, basada en Hignett y McAtamney (2000). https://ergo-plus.com/wp-content/uploads/REBA.pdf | PDF | Tablas A, B, C (verificación cruzada) |
| **[EP-RULA-EJ]** | Middlesworth, M. *RULA: A Step-by-Step Guide*. Ergonomics Plus. https://ergo-plus.com/wp-content/uploads/RULA-A-Step-by-Step-Guide1.pdf | PDF | Ejemplo resuelto de RULA (resultado 7) |
| **[CORNELL]** | Hedge, A. (2014). *DEA4700: REBA y RULA* (diapositivas). Cornell University. https://ergo.human.cornell.edu/studentdownloads/DEA4700pdfs/jsirebarula.pdf | PDF | Modificadores de RULA tal como los cita del original |

---

## 1. RULA (McAtamney y Corlett, 1993)

Fuente principal de valores: **[ERG-RULA]**, contrastada con **[HEDGE-RULA]** y **[CORNELL]**.
Se evalúa **cada lado (izquierdo y derecho) por separado**.

### 1.1 Grupo A – Brazo ([ERG-RULA] Tabla 1)
| Posición | Puntos |
|---|---|
| Desde 20° de extensión hasta 20° de flexión | 1 |
| Extensión > 20° o flexión > 20° y ≤ 45° | 2 |
| Flexión > 45° y ≤ 90° | 3 |
| Flexión > 90° | 4 |

Modificadores ([ERG-RULA] Tabla 2; [CORNELL]; [HEDGE-RULA]):
| Modificador | Puntos | Fuente |
|---|---|---|
| Hombro elevado | +1 | todas |
| Brazo abducido | +1 | todas |
| Existe punto de apoyo o la persona se inclina | −1 | todas |
| **Brazo rotado** | +1 | **solo [ERG-RULA]** («hombro elevado o brazo rotado») — ver Diferencia D1 |

### 1.2 Grupo A – Antebrazo ([ERG-RULA] Tablas 3 y 4)
| Posición | Puntos |
|---|---|
| Flexión entre 60° y 100° | 1 |
| Flexión < 60° o > 100° | 2 |
| Modificador: trabaja a un lado del cuerpo **o** cruza la línea media (excluyentes, máx. +1) | +1 |

### 1.3 Grupo A – Muñeca ([ERG-RULA] Tablas 5 y 6)
| Posición | Puntos |
|---|---|
| Posición neutra | 1 |
| Flexión o extensión > 0° y < 15° | 2 |
| Flexión o extensión ≥ 15° | 3 |
| Modificador: desviación radial **o** cubital (máx. +1) | +1 |

### 1.4 Grupo A – Giro de muñeca ([ERG-RULA] Tabla 7) — se usa aparte, no se suma a la muñeca
| Posición | Puntos |
|---|---|
| Pronación/supinación media (o ninguna) | 1 |
| Pronación/supinación extrema | 2 |

### 1.5 Grupo B – Cuello ([ERG-RULA] Tablas 8 y 9)
| Posición | Puntos |
|---|---|
| Flexión 0°–10° | 1 |
| Flexión > 10° y ≤ 20° | 2 |
| Flexión > 20° | 3 |
| Extensión (cualquier grado) | 4 |
| Cabeza rotada | +1 |
| Inclinación lateral | +1 (pueden sumarse ambos, máx. +2) |

### 1.6 Grupo B – Tronco ([ERG-RULA] Tablas 10 y 11)
| Posición | Puntos |
|---|---|
| De pie erguido, o sentado bien apoyado con ángulo tronco-muslos > 90° | 1 |
| Flexión > 0° y ≤ 20° | 2 |
| Flexión > 20° y ≤ 60° | 3 |
| Flexión > 60° | 4 |
| Tronco rotado | +1 |
| Inclinación lateral | +1 (máx. +2) |

### 1.7 Grupo B – Piernas ([ERG-RULA] Tabla 12)
| Posición | Puntos |
|---|---|
| Sentado con piernas y pies bien apoyados | 1 |
| De pie, peso simétrico y espacio para cambiar de posición | 1 |
| Pies sin apoyo o peso asimétrico | 2 |

### 1.8 Tabla A – Puntuación del Grupo A ([ERG-RULA] Tabla 13 = [HEDGE-RULA] Tabla A)
Filas: brazo (1–6) × antebrazo (1–3). Columnas: muñeca 1–4, cada una con giro 1 y 2.

| Brazo | Antebrazo | M1·G1 | M1·G2 | M2·G1 | M2·G2 | M3·G1 | M3·G2 | M4·G1 | M4·G2 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 |
| 1 | 2 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| 1 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 4 | 4 |
| 2 | 1 | 2 | 3 | 3 | 3 | 3 | 4 | 4 | 4 |
| 2 | 2 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 4 |
| 2 | 3 | 3 | 4 | 4 | 4 | 4 | 4 | 5 | 5 |
| 3 | 1 | 3 | 3 | 4 | 4 | 4 | 4 | 5 | 5 |
| 3 | 2 | 3 | 4 | 4 | 4 | 4 | 4 | 5 | 5 |
| 3 | 3 | 4 | 4 | 4 | 4 | 4 | 5 | 5 | 5 |
| 4 | 1 | 4 | 4 | 4 | 4 | 4 | 5 | 5 | 5 |
| 4 | 2 | 4 | 4 | 4 | 4 | 4 | 5 | 5 | 5 |
| 4 | 3 | 4 | 4 | 4 | 5 | 5 | 5 | 6 | 6 |
| 5 | 1 | 5 | 5 | 5 | 5 | 5 | 6 | 6 | 7 |
| 5 | 2 | 5 | 6 | 6 | 6 | 6 | 7 | 7 | 7 |
| 5 | 3 | 6 | 6 | 6 | 7 | 7 | 7 | 7 | 8 |
| 6 | 1 | 7 | 7 | 7 | 7 | 7 | 8 | 8 | 9 |
| 6 | 2 | 8 | 8 | 8 | 8 | 8 | 9 | 9 | 9 |
| 6 | 3 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 |

### 1.9 Tabla B – Puntuación del Grupo B ([ERG-RULA] Tabla 14 = [HEDGE-RULA] Tabla B)
Filas: cuello (1–6). Columnas: tronco 1–6, cada uno con piernas 1 y 2.

| Cuello | T1·P1 | T1·P2 | T2·P1 | T2·P2 | T3·P1 | T3·P2 | T4·P1 | T4·P2 | T5·P1 | T5·P2 | T6·P1 | T6·P2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 2 | 3 | 3 | 4 | 5 | 5 | 6 | 6 | 7 | 7 |
| 2 | 2 | 3 | 2 | 3 | 4 | 5 | 5 | 5 | 6 | 7 | 7 | 7 |
| 3 | 3 | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 | 7 | 7 | 7 |
| 4 | 5 | 5 | 5 | 6 | 6 | 7 | 7 | 7 | 7 | 7 | 8 | 8 |
| 5 | 7 | 7 | 7 | 7 | 7 | 8 | 8 | 8 | 8 | 8 | 8 | 8 |
| 6 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 9 | 9 | 9 | 9 |

### 1.10 Actividad muscular y carga ([ERG-RULA] Tablas 15 y 16)
Se suman a la puntuación del Grupo A (→ **puntuación C**) y del Grupo B (→ **puntuación D**).

| Actividad | Puntos |
|---|---|
| Estática (postura mantenida > 1 minuto seguido) | +1 |
| Repetitiva (> 4 veces por minuto) | +1 |
| Ocasional, poco frecuente y de corta duración | 0 |

> Nota: estática y repetitiva dan un único +1 («si la postura es principalmente estática **o** se repite…», [CORNELL]). Ver D3.

| Carga o fuerza | Puntos |
|---|---|
| < 2 kg, intermitente | 0 |
| 2–10 kg, intermitente | +1 |
| 2–10 kg, estática o repetitiva | +2 |
| > 10 kg, intermitente | +2 |
| > 10 kg, estática o repetitiva | +3 |
| Golpes o fuerzas bruscas o repentinas | +3 |

### 1.11 Tabla C – Puntuación final ([ERG-RULA] Tabla 17 = [HEDGE-RULA] Tabla C)
Filas: puntuación C (8 = «8 o más»). Columnas: puntuación D (7 = «7 o más»).

| C \ D | 1 | 2 | 3 | 4 | 5 | 6 | 7+ |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 3 | 3 | 4 | 5 | 5 |
| 2 | 2 | 2 | 3 | 4 | 4 | 5 | 5 |
| 3 | 3 | 3 | 3 | 4 | 4 | 5 | 6 |
| 4 | 3 | 3 | 3 | 4 | 5 | 6 | 6 |
| 5 | 4 | 4 | 4 | 5 | 6 | 7 | 7 |
| 6 | 4 | 4 | 5 | 6 | 6 | 7 | 7 |
| 7 | 5 | 5 | 6 | 6 | 7 | 7 | 7 |
| 8+ | 5 | 5 | 6 | 7 | 7 | 7 | 7 |

### 1.12 Niveles de actuación ([ERG-RULA] Tabla 18)
| Puntuación | Nivel | Actuación |
|---|---|---|
| 1–2 | 1 | Riesgo aceptable |
| 3–4 | 2 | Pueden requerirse cambios; conviene profundizar en el estudio |
| 5–6 | 3 | Se requiere el rediseño de la tarea |
| 7 | 4 | Se requieren cambios urgentes |

### 1.13 Ejemplo resuelto para pruebas ([EP-RULA-EJ], págs. 5–11)
Brazo 3, antebrazo 2, muñeca 3 + 1 (desviación cubital) = 4, giro 2 → Tabla A = **5**; actividad 0, carga +2 → C = **7**.
Cuello 3, tronco 2, piernas 1 → Tabla B = **3**; actividad 0, carga +2 → D = **5**.
Tabla C (7, 5) → **RULA = 7**, nivel 4.
> Observación: el texto de la guía dice «tronco +1» pero la hoja que acompaña marca tronco = 2 y Tabla B = 3, que es lo coherente con la tabla. Se usa la hoja.

---

## 2. REBA (Hignett y McAtamney, 2000)

Fuente principal: **[ERG-REBA]**, contrastada con **[NTP601]** y **[HEDGE-REBA]**. Lado izquierdo y derecho por separado.

### 2.1 Grupo A – Tronco ([ERG-REBA] Tablas 1 y 2; [NTP601] Fig. 1)
| Posición | Puntos |
|---|---|
| Erguido | 1 |
| Flexión o extensión 0°–20° | 2 |
| Flexión > 20° y ≤ 60°, o extensión > 20° | 3 |
| Flexión > 60° | 4 |
| Rotación **o** inclinación lateral | +1 (único) — ver D4 |

### 2.2 Grupo A – Cuello ([ERG-REBA] Tablas 3 y 4; [NTP601])
| Posición | Puntos |
|---|---|
| Flexión 0°–20° | 1 |
| Flexión > 20° o extensión | 2 |
| Rotación **o** inclinación lateral | +1 (único) — ver D4 |

### 2.3 Grupo A – Piernas ([ERG-REBA] Tablas 5 y 6; [NTP601])
| Posición | Puntos |
|---|---|
| Sentado, andando o de pie con soporte bilateral simétrico | 1 |
| De pie con soporte unilateral, soporte ligero o postura inestable | 2 |
| Flexión de una o ambas rodillas entre 30° y 60° | +1 |
| Flexión de rodillas > 60° (no aplica sentado) | +2 |

### 2.4 Grupo B – Brazo ([ERG-REBA] Tablas 7 y 8; [NTP601] Fig. 2)
| Posición | Puntos |
|---|---|
| 20° de extensión a 20° de flexión | 1 |
| Extensión > 20° o flexión > 20° y ≤ 45° | 2 |
| Flexión > 45° y ≤ 90° | 3 |
| Flexión > 90° | 4 |
| Brazo abducido o rotado | +1 |
| Hombro elevado | +1 |
| Punto de apoyo o postura a favor de la gravedad | −1 |

### 2.5 Grupo B – Antebrazo ([ERG-REBA] Tabla 9) — sin modificadores
| Flexión 60°–100° | 1 |
|---|---|
| Flexión < 60° o > 100° | 2 |

### 2.6 Grupo B – Muñeca ([ERG-REBA] Tablas 10 y 11; [NTP601])
| Posición | Puntos |
|---|---|
| Flexión/extensión 0°–15° | 1 |
| Flexión/extensión > 15° | 2 |
| Torsión o desviación radial/cubital | +1 |

### 2.7 Tabla A ([ERG-REBA] Tabla 12 = [NTP601] Fig. 3 = [HEDGE-REBA])
Filas: tronco 1–5. Columnas: cuello 1–3, cada uno con piernas 1–4.

| Tronco | C1·P1 | C1·P2 | C1·P3 | C1·P4 | C2·P1 | C2·P2 | C2·P3 | C2·P4 | C3·P1 | C3·P2 | C3·P3 | C3·P4 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 | 3 | 3 | 5 | 6 |
| 2 | 2 | 3 | 4 | 5 | 3 | 4 | 5 | 6 | 4 | 5 | 6 | 7 |
| 3 | 2 | 4 | 5 | 6 | 4 | 5 | 6 | 7 | 5 | 6 | 7 | 8 |
| 4 | 3 | 5 | 6 | 7 | 5 | 6 | 7 | 8 | 6 | 7 | 8 | 9 |
| 5 | 4 | 6 | 7 | 8 | 6 | 7 | 8 | 9 | 7 | 8 | 9 | 9 |

### 2.8 Tabla B ([ERG-REBA] Tabla 13 = [NTP601] Fig. 4 = [HEDGE-REBA])
Filas: brazo 1–6. Columnas: antebrazo 1–2, cada uno con muñeca 1–3.

| Brazo | A1·M1 | A1·M2 | A1·M3 | A2·M1 | A2·M2 | A2·M3 |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 2 | 1 | 2 | 3 |
| 2 | 1 | 2 | 3 | 2 | 3 | 4 |
| 3 | 3 | 4 | 5 | 4 | 5 | 5 |
| 4 | 4 | 5 | 5 | 5 | 6 | 7 |
| 5 | 6 | 7 | 8 | 7 | 8 | 8 |
| 6 | 7 | 8 | 8 | 8 | 9 | 9 |

### 2.9 Carga/fuerza (→ Puntuación A) y agarre (→ Puntuación B) ([ERG-REBA] Tablas 14–17; [NTP601])
| Carga o fuerza | Puntos |
|---|---|
| < 5 kg | 0 |
| 5–10 kg | +1 |
| > 10 kg | +2 |
| Fuerza o carga aplicada bruscamente | +1 adicional |

| Agarre | Descripción | Puntos |
|---|---|---|
| Bueno | Agarre bueno y fuerza de agarre de rango medio | 0 |
| Regular | Aceptable pero no ideal, o aceptable usando otras partes del cuerpo | +1 |
| Malo | Posible pero no aceptable | +2 |
| Inaceptable | Torpe e inseguro; no es posible el agarre manual o es inaceptable usando otras partes del cuerpo | +3 |

### 2.10 Tabla C ([ERG-REBA] Tabla 18 = [NTP601] Fig. 5 = [HEDGE-REBA])
Filas: Puntuación A (1–12). Columnas: Puntuación B (1–12).

| A \ B | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 3 | 3 | 4 | 5 | 6 | 7 | 7 | 7 |
| 2 | 1 | 2 | 2 | 3 | 4 | 4 | 5 | 6 | 6 | 7 | 7 | 8 |
| 3 | 2 | 3 | 3 | 3 | 4 | 5 | 6 | 7 | 7 | 8 | 8 | 8 |
| 4 | 3 | 4 | 4 | 4 | 5 | 6 | 7 | 8 | 8 | 9 | 9 | 9 |
| 5 | 4 | 4 | 4 | 5 | 6 | 7 | 8 | 8 | 9 | 9 | 9 | 9 |
| 6 | 6 | 6 | 6 | 7 | 8 | 8 | 9 | 9 | 10 | 10 | 10 | 10 |
| 7 | 7 | 7 | 7 | 8 | 9 | 9 | 9 | 10 | 10 | 11 | 11 | 11 |
| 8 | 8 | 8 | 8 | 9 | 10 | 10 | 10 | 10 | 10 | 11 | 11 | 11 |
| 9 | 9 | 9 | 9 | 10 | 10 | 10 | 11 | 11 | 11 | 12 | 12 | 12 |
| 10 | 10 | 10 | 10 | 11 | 11 | 11 | 11 | 12 | 12 | 12 | 12 | 12 |
| 11 | 11 | 11 | 11 | 11 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 |
| 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 | 12 |

### 2.11 Actividad (se suma a C; no excluyentes, hasta +3) ([ERG-REBA] Tabla 19; [NTP601])
| Actividad | Puntos |
|---|---|
| Una o más partes del cuerpo estáticas (> 1 minuto) | +1 |
| Movimientos repetitivos (> 4 veces/minuto, sin contar caminar) | +1 |
| Cambios de postura importantes o posturas inestables | +1 |

### 2.12 Niveles ([ERG-REBA] Tabla 20 = [NTP601] Fig. 6)
| Puntuación | Nivel de acción | Riesgo | Actuación |
|---|---|---|---|
| 1 | 0 | Inapreciable | No es necesaria |
| 2–3 | 1 | Bajo | Puede ser necesaria |
| 4–7 | 2 | Medio | Es necesaria |
| 8–10 | 3 | Alto | Es necesaria cuanto antes |
| 11–15 | 4 | Muy alto | Es necesaria de inmediato |

### 2.13 Ejemplo resuelto para pruebas ([NTP601], apartado 4, versión corregida 2003)
Tronco 3, cuello 1, piernas 1 + 2 = 3 → Tabla A = **5**; carga > 10 kg (+2) y brusca (+1) → Puntuación A = **8**.
Brazo 3 − 1 (apoyo) = 2, antebrazo 2, muñeca 1 → Tabla B = **2**; agarre regular +1 → Puntuación B = **3**.
Tabla C (8, 3) = **8**; actividad +1 (cambios rápidos de postura) → **REBA = 9**, riesgo **alto**, nivel 3.

---

## 3. ROSA (Sonne, Villalta y Andrews, 2012)

Fuente principal: **[SONNE]** (artículo original leído completo), contrastado con **[NTP1173]** y **[ERG-ROSA]**.

### 3.1 Silla – Altura del asiento ([SONNE] Tabla 1 y Fig. 1A; [NTP1173] A-1)
| Situación | Puntos |
|---|---|
| Rodillas a ≈ 90° | 1 |
| Asiento muy bajo (rodilla < 90°) | 2 |
| Asiento muy alto (rodilla > 90°) | 2 |
| Pies sin contacto con el suelo | 3 |
| + Espacio insuficiente para las piernas bajo la mesa | +1 |
| + Altura no regulable | +1 |

### 3.2 Silla – Profundidad del asiento ([SONNE]; [NTP1173] A-2)
| Situación | Puntos |
|---|---|
| ≈ 8 cm (7,5 cm en el texto original) entre el borde y la parte trasera de la rodilla | 1 |
| Asiento muy largo (< 8 cm) | 2 |
| Asiento muy corto (> 8 cm) | 2 |
| + Profundidad no regulable | +1 |

### 3.3 Silla – Reposabrazos ([SONNE]; [NTP1173] A-3)
| Situación | Puntos |
|---|---|
| Codos apoyados a 90°, en línea con los hombros, hombros relajados | 1 |
| Demasiado altos (hombros encogidos) o demasiado bajos (codos sin apoyo) | 2 |
| + Demasiado separados | +1 |
| + Superficie dura o dañada | +1 |
| + No regulables | +1 |

> [NTP1173]: si la silla **no tiene reposabrazos**, puede asimilarse a «codos sin apoyar» = 2.

### 3.4 Silla – Respaldo ([SONNE]; [NTP1173] A-4)
| Situación | Puntos |
|---|---|
| Apoyo lumbar adecuado y reclinado entre 95° y 110° | 1 |
| Sin apoyo lumbar o mal situado | 2 |
| Reclinado > 110° o < 95° | 2 |
| Sin respaldo o no se usa (taburete, inclinado hacia delante) | 2 |
| + Superficie de trabajo demasiado alta (hombros encogidos) | +1 |
| + Respaldo no regulable | +1 |

### 3.5 Tiempo de uso diario (se suma a silla, pantalla, teléfono, ratón y teclado) ([SONNE] §2.3.7; [NTP1173] Tabla F)
| Tiempo | Puntos |
|---|---|
| < 1 h al día en total o < 30 min seguidos | −1 |
| 1–4 h al día o 30 min–1 h seguidos | 0 |
| > 4 h al día o > 1 h seguida | +1 |

### 3.6 Tabla A – Silla ([SONNE] Fig. 2; [NTP1173]; [ERG-ROSA] Tabla 6)
Filas: altura + profundidad (2–8). Columnas: reposabrazos + respaldo (2–9). Al resultado se suma el tiempo de uso de la silla.

| Alt+Prof \ Rep+Resp | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| 2 | 2 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| 3 | 2 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| 4 | 3 | 3 | 3 | 4 | 5 | 6 | 7 | 8 |
| 5 | 4 | 4 | 4 | 4 | 5 | 6 | 7 | 8 |
| 6 | 5 | 5 | 5 | 5 | 6 | 7 | 8 | 9 |
| 7 | 6 | 6 | 6 | 7 | 7 | 8 | 8 | 9 |
| 8 | 7 | 7 | 7 | 8 | 8 | 9 | 9 | 9 |

### 3.7 Pantalla ([SONNE] Tabla 2 y Fig. 3A; [NTP1173] B-2)
| Situación | Puntos |
|---|---|
| A la distancia del brazo (40–75 cm) y a la altura de los ojos | 1 |
| Muy baja (por debajo de 30° bajo los ojos; flexión de cuello) | 2 |
| Muy alta (extensión de cuello) | 3 |
| + Hay que girar el cuello | +1 |
| + Muy lejos (> 75 cm) | +1 — ver D5 |
| + Reflejos o brillos en la pantalla | +1 (Fig. 3A) |
| + Se usan documentos y no hay atril | +1 |
| + Tiempo de uso | −1 / 0 / +1 |

### 3.8 Teléfono ([SONNE]; [NTP1173] B-1)
| Situación | Puntos |
|---|---|
| Auriculares, o una mano con cuello neutro, y teléfono a ≤ 30 cm | 1 |
| Teléfono a > 30 cm | 2 |
| + Se sujeta entre cuello y hombro | +2 |
| + Sin opción de manos libres | +1 |
| + Tiempo de uso | −1 / 0 / +1 |

### 3.9 Tabla B – Pantalla y teléfono ([SONNE] Fig. 2; [ERG-ROSA] Tabla 10; [NTP1173] Tabla B)
Filas: teléfono (0–6). Columnas: pantalla (0–7).

| Tel \ Pant | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 1 | 1 | 2 | 3 | 4 | 5 | 6 |
| 1 | 1 | 1 | 2 | 2 | 3 | 4 | 5 | 6 |
| 2 | 1 | 2 | 2 | 3 | 3 | 4 | 6 | 7 |
| 3 | 2 | 2 | 3 | 3 | 4 | 5 | 6 | 8 |
| 4 | 3 | 3 | 4 | 4 | 5 | 6 | 7 | 8 |
| 5 | 4 | 4 | 5 | 5 | 6 | 7 | 8 | 9 |
| 6 | 5 | 5 | 6 | 7 | 8 | 8 | 9 | 9 |

> [NTP1173] añade una columna «8» idéntica a la «7». Ver D5.

### 3.10 Ratón ([SONNE]; [NTP1173] C-1)
| Situación | Puntos |
|---|---|
| Alineado con el hombro | 1 |
| No alineado o lejos del cuerpo | 2 |
| + Agarre en pinza / ratón pequeño | +1 |
| + Ratón y teclado a diferente altura | +2 |
| + Reposamanos duro o puntos de presión | +1 |
| + Tiempo de uso | −1 / 0 / +1 |

### 3.11 Teclado ([SONNE] Tabla 2 y Fig. 3D; [NTP1173] C-2)
| Situación | Puntos |
|---|---|
| Muñecas rectas, hombros relajados | 1 |
| Muñecas extendidas > 15° (teclado con inclinación positiva) | 2 |
| + Muñecas desviadas al escribir | +1 |
| + Teclado demasiado alto (hombros encogidos) | +1 |
| + Alcanzar objetos por encima de la cabeza | +1 (§2.3.6 y Fig. 3D) |
| + Teclado o plataforma no regulable | +1 |
| + Tiempo de uso | −1 / 0 / +1 |

### 3.12 Tabla C – Ratón y teclado ([SONNE] Fig. 2; [NTP1173]; [ERG-ROSA] Tabla 13)
Filas: ratón (0–7). Columnas: teclado (0–7). La tabla es simétrica.

| Rat \ Tecl | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 1 | 1 | 2 | 3 | 4 | 5 | 6 |
| 1 | 1 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| 2 | 1 | 2 | 2 | 3 | 4 | 5 | 6 | 7 |
| 3 | 2 | 3 | 3 | 3 | 5 | 6 | 7 | 8 |
| 4 | 3 | 4 | 4 | 5 | 5 | 6 | 7 | 8 |
| 5 | 4 | 5 | 5 | 6 | 6 | 7 | 8 | 9 |
| 6 | 5 | 6 | 6 | 7 | 7 | 8 | 8 | 9 |
| 7 | 6 | 7 | 7 | 8 | 8 | 9 | 9 | 9 |

### 3.13 Tabla D – Pantalla y periféricos ([SONNE]; [NTP1173]; [ERG-ROSA] Tabla 14)
Filas: Tabla B (1–9). Columnas: Tabla C (1–9). Equivale a **máx(B, C)** (verificado celda por celda).

### 3.14 Tabla E – Puntuación final ([SONNE]; [NTP1173]; [ERG-ROSA] Tabla 15)
Filas: silla (Tabla A + tiempo, 1–10). Columnas: Tabla D (1–10). Equivale a **máx(silla, D)**; la propia [NTP1173] lo indica: «el resultado de la tabla E es directamente el mayor de ambos valores».
En el código se guardan las tablas completas (para resaltar la celda en los anexos), no solo la fórmula.

### 3.15 Niveles
- [SONNE]: **nivel de acción = 5**; con ROSA ≥ 5 se recomiendan cambios inmediatos. El original no define más niveles.
- [ERG-ROSA] Tabla 1/16 (escala de 5 niveles, propia de Ergonautas):

| Puntuación | Riesgo | Nivel | Actuación |
|---|---|---|---|
| 1 | Inapreciable | 0 | No es necesaria |
| 2–4 | Mejorable | 1 | Pueden mejorarse algunos elementos |
| 5 | Alto | 2 | Es necesaria |
| 6–8 | Muy alto | 3 | Es necesaria cuanto antes |
| 9–10 | Extremo | 4 | Es necesaria urgentemente |

### 3.16 Ejemplos resueltos para pruebas
**Ejemplo 1 – [NTP1173] apartado 4:** altura 2 + 1 = 3; profundidad 1; reposabrazos 2 + 1 = 3; respaldo 2 + 1 = 3 → Tabla A (4, 6) = 5; tiempo > 4 h (+1) → **silla = 6**.
Teléfono 1 + 0 = 1; pantalla 1 + 1 (sin atril) + 1 (> 4 h) = 3 → Tabla B = 2.
Ratón 2 + 1 (presión) + 1 (> 4 h) = 4; teclado 1 + 0 = 1 → Tabla C = 4. Tabla D (2, 4) = 4. Tabla E (6, 4) → **ROSA = 6**.

**Ejemplo 2 – [SONNE] Tabla 3 y Fig. 2:** altura 2 + 1 = 3; profundidad 1; reposabrazos 2 + 1 = 3; respaldo 2 + 1 + 1 = 4 → Tabla A (4, 7) = 6; tiempo +1 → **silla = 7**.
Pantalla 3 + 1 (documentos) + 1 (tiempo) = 5; teléfono 1 + 0 = 1 → Tabla B = 4.
Ratón 2 + 1 (reposamanos) + 1 = 4; teclado 1 + 1 = 2 → Tabla C = 4. Tabla D (4, 4) = 4. Tabla E (7, 4) → **ROSA = 7**.

---

## 4. Diferencias entre fuentes y decisiones

| # | Tema | Qué dice cada fuente | Decisión propuesta | Estado |
|---|---|---|---|---|
| **D1** | RULA: «brazo rotado +1» | [ERG-RULA] lo incluye («hombro elevado o brazo rotado»). [CORNELL] y [HEDGE-RULA], que citan el original, solo tienen hombro elevado, abducción y apoyo. | Seguir el original: **sin** «brazo rotado» en RULA (en REBA sí existe). | **Pendiente de verificar** en el texto de 1993 (no accesible). Se pide confirmación a Camilo. |
| **D2** | RULA: tablas A y B | [ERG-RULA] y [HEDGE-RULA] coinciden celda por celda, y el ejemplo de [EP-RULA-EJ] cuadra. Las diapositivas [CORNELL] traen varias celdas distintas (p. ej. brazo 2). | Usar [ERG-RULA] = [HEDGE-RULA]. [CORNELL] se considera error de transcripción. | Resuelto (2 fuentes + ejemplo). |
| **D3** | RULA: tiempo para «estática» | [ERG-RULA] y [CORNELL]: > 1 minuto. [HEDGE-RULA] y [EP-RULA-EJ]: > 10 minutos. | > 1 minuto (es lo que [CORNELL] cita del original). | Resuelto. |
| **D4** | REBA: torsión e inclinación de cuello/tronco | [ERG-REBA] y [NTP601]: +1 único si hay torsión **o** inclinación. [HEDGE-REBA]: +1 por cada una (hasta +2). | +1 único ([NTP601] es adaptación directa del original). | **Pendiente de verificar** en el texto de 2000 (no accesible). |
| **D5** | ROSA: «pantalla muy lejos +1» | [SONNE] Tabla 2: modificador independiente. [SONNE] Fig. 3A lo dibuja bajo «muy baja». [ERG-ROSA]: solo cuenta si la pantalla está muy baja. [NTP1173]: independiente y amplía la Tabla B a pantalla = 8. | Independiente (Tabla 2 del original y [NTP1173]); si la pantalla suma 8, se usa la columna 7 (igual a la 8 de la NTP). | Se informa a Camilo. |
| **D6** | ROSA: niveles de 0 a 4 | [SONNE] solo define el nivel de acción en 5. La escala de 5 niveles es de [ERG-ROSA]. | Usar la escala de [ERG-ROSA] y citar que el umbral 5 viene del original. | Se informa a Camilo. |
| **D7** | RULA y REBA: puntuación de brazo 0 (p. ej. 1 − 1 por apoyo) | Ninguna fuente dice qué hacer. | Mínimo 1 (las tablas empiezan en 1). | **Pendiente de verificar**. Se pide confirmación. |
| **D8** | RULA: actividad y carga por grupo | El original las puntúa por separado para A y B ([CORNELL], hoja de Hedge). [ERG-RULA] las aplica a ambos grupos a la vez. | Pedirlas por grupo, con el mismo valor por defecto. | Resuelto. |

## 5. Referencias (APA 7)

- Diego-Mas, J. A. (2025). *Evaluación postural mediante el método RULA*. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/rula/rula-ayuda.php
- Diego-Mas, J. A. (2025). *Evaluación postural mediante el método REBA*. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/reba/reba-ayuda.php
- Diego-Mas, J. A. (2025). *Evaluación de puestos de oficina mediante el método ROSA*. Ergonautas, Universitat Politècnica de València. https://www.ergonautas.upv.es/metodos/rosa/rosa-ayuda.php
- Hignett, S., & McAtamney, L. (2000). Rapid Entire Body Assessment (REBA). *Applied Ergonomics, 31*(2), 201–205. https://doi.org/10.1016/S0003-6870(99)00039-3
- Instituto Nacional de Seguridad y Salud en el Trabajo. (2022). *NTP 1173: Modelo para la evaluación de puestos de trabajo en oficina: método ROSA (Rapid Office Strain Assessment)*. INSST.
- McAtamney, L., & Corlett, E. N. (1993). RULA: A survey method for the investigation of work-related upper limb disorders. *Applied Ergonomics, 24*(2), 91–99. https://doi.org/10.1016/0003-6870(93)90080-S
- Nogareda Cuixart, S. (2001). *NTP 601: Evaluación de las condiciones de trabajo: carga postural. Método REBA (Rapid Entire Body Assessment)*. Instituto Nacional de Seguridad e Higiene en el Trabajo.
- Sonne, M., Villalta, D. L., & Andrews, D. M. (2012). Development and evaluation of an office ergonomic risk checklist: ROSA – Rapid office strain assessment. *Applied Ergonomics, 43*(1), 98–108. https://doi.org/10.1016/j.apergo.2011.03.008
