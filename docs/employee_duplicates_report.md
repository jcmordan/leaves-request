# Employee CSV Duplicate Analysis Report

This report identifies duplicate records in `Employee.csv` based on **Ficha (EmployeeCode)**, **Cedula (NationalId)**, and **Email**.

## Duplicate Ficha (EmployeeCode)
The following `Ficha` values are assigned to multiple people in the CSV:

| Ficha | Names | Lines |
| :--- | :--- | :--- |
| **F-95891** | Adriano Jesús Torrez Ortiz, Alex Alexander Montero, Andrés de los Santos | 4, 15, 30 |
| **F-53124** | Alberto Rodriguez Roso, Edison Osiris Soto | 6, 106 |
| **F-01752** | Angelina Santos Isaac, Arisleyda Jazmín Rosario Rodríguez | 40, 51 |
| **F-01252** | Alexis Tomas Barrientos Rodriguez, Eli Enrique Santana Noboa | 21, 114 |
| **F-01827** | Alemilinson Nova Suero, Edwin Tomás Peña Aquino | 13, 112 |
| **F-01800** | Anthony Trinidad Pichardo, Elio Osiris Méndez | 44, 118 |
| **F-748** | Ariel Emilio Feliz Lobera, Elvis Leoncio Pérez Hidalgo | 48, 124 |
| **F-775** | Angela Virginia Herrera Portalatin, Kelvin Raul Nolazco Vargas | 39, 294 |
| **F-15406** | Jose Alberto Alvino, Jose Ernesto Encarnación | 229, 238 |
| **F-5015** | Elmo Paulino Paulino, Kerlin Rafael Gonzalez Abreu | 119, 298 |
| **F-528** | Jose Luis Paniagua Guzman, Victor Hugo Florentino Castillo | 245, 508 |
| **F-01816** | Juana Jacqueline Figuereo Figuereo, Miguel Elías Roja | 279, 384 |
| **F-01891** | Junior Mejia Matos, Noble Emilo Castillo Beriguete | 290, 398 |
| **F-3495** | Leonel Rosario Castillo, Ranfy De Oleo Cola | 311, 440 |
| **F-01801** | Limber Encarnacion Paniagua, Tomas Guillen Baez | 313, 500 |
| **F-01841** | Mario Enrique Paulino Valdéz, Tomas Peña | 359, 501 |
| **F-12350** | Vidal Morillo, Yoel Pérez Díaz | 513, 538 |

## Duplicate Cedula (NationalId)
The following `Cedula` numbers appear more than once:

| Cedula | Names | Lines |
| :--- | :--- | :--- |
| **00201389418** | Pedro De Jesús De la Cruz Montero, Wilkins Ernesto Beltrán | 416, 524 |
| **00116450420** | René Alberto Mancebo Pérez, René Cecilio González Aquino | 447, 448 |
| **40227749070** | Richard Manuel Mañan Perdomo, Richard Starling Ledesma Aponte | 451, 452 |

## Duplicate Email
No duplicate email addresses were found (excluding blank entries).

---
**Note:** The `EmployeeSeeder.cs` has been updated to handle these duplicates by skipping records that match an already processed `EmployeeCode` or `NationalId`.
