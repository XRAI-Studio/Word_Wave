// Level 3 course content: typed-answer (fill-in-the-blank) reinforcement.
// Every word here is a reference to vocabulary already taught at Level 1 or
// Level 2 — term AND translation must match the original exactly (the seed
// validates this). Sentences are fresh remixes of known vocab.

import { w, s, type SectionDef } from "./course-types";

export const level3Sections: SectionDef[] = [
  // ==================== L3 · FOUNDATIONS ====================
  {
    id: "section-l3-1",
    title: "Foundations — Level 3",
    description: "Type it from memory: greetings, home, food, and animals",
    fillBlank: true,
    units: [
      {
        title: "Greetings Recall",
        description: "Every hello and goodbye, typed out",
        words: [w("hola", "hello"), w("adiós", "goodbye"), w("gracias", "thank you"), w("buenas tardes", "good afternoon"), w("hasta pronto", "see you soon"), w("igualmente", "likewise")],
        sentences: [
          s("hola buenas tardes", "hello good afternoon", ["hola", "buenas tardes", "adiós", "gracias"], ["hola", "buenas tardes"]),
          s("gracias y hasta pronto", "thank you and see you soon", ["gracias", "y", "hasta pronto", "igualmente"], ["gracias", "hasta pronto"]),
          s("adiós hasta mañana", "goodbye see you tomorrow", ["adiós", "hasta mañana", "hola", "hasta pronto"], ["adiós", "hasta mañana"]),
        ],
      },
      {
        title: "People & Home Recall",
        description: "The people and rooms you know",
        words: [w("el hombre", "the man"), w("la mujer", "the woman"), w("el vecino", "the neighbor"), w("la casa", "the house"), w("la sala", "the living room"), w("el jardín", "the garden")],
        sentences: [
          s("el vecino y el hombre", "the neighbor and the man", ["el vecino", "y", "el hombre", "la mujer"], ["el vecino", "el hombre"]),
          s("la mujer está en la sala", "the woman is in the living room", ["la mujer", "está", "en", "la sala", "el jardín"], ["la mujer", "la sala"]),
          s("la casa y el jardín", "the house and the garden", ["la casa", "y", "el jardín", "la sala"], ["la casa", "el jardín"]),
        ],
      },
      {
        title: "Food & Drink Recall",
        description: "Bread, meat, coffee — spell them all",
        words: [w("el pan", "the bread"), w("el queso", "the cheese"), w("la carne", "the meat"), w("el pollo", "the chicken"), w("el café", "the coffee"), w("la cerveza", "the beer")],
        sentences: [
          s("el pan y la carne", "the bread and the meat", ["el pan", "y", "la carne", "el queso"], ["el pan", "la carne"]),
          s("el pollo y el queso", "the chicken and the cheese", ["el pollo", "y", "el queso", "la carne"], ["el pollo", "el queso"]),
          s("la cerveza y el café", "the beer and the coffee", ["la cerveza", "y", "el café", "el pan"], ["la cerveza", "el café"]),
        ],
      },
      {
        title: "Animals & Colors Recall",
        description: "Dogs, lions, and their colors",
        words: [w("el perro", "the dog"), w("el gato", "the cat"), w("el león", "the lion"), w("el oso", "the bear"), w("rojo", "red"), w("negro", "black")],
        sentences: [
          s("el león es grande", "the lion is big", ["el león", "es", "grande", "el oso"], ["el león", "grande"]),
          s("el oso es negro", "the bear is black", ["el oso", "es", "negro", "rojo"], ["el oso", "negro"]),
          s("el gato y el oso", "the cat and the bear", ["el gato", "y", "el oso", "el perro"], ["el gato", "el oso"]),
        ],
      },
      {
        title: "More Greetings Recall",
        description: "Mornings, nights, and welcomes",
        words: [w("buenos días", "good morning"), w("buenas noches", "good night"), w("por favor", "please"), w("bienvenidos", "welcome (plural)"), w("hasta mañana", "see you tomorrow"), w("encantado", "delighted")],
        sentences: [
          s("buenos días y buenas noches", "good morning and good night", ["buenos días", "y", "buenas noches", "por favor"], ["buenos días", "buenas noches"]),
          s("gracias por favor", "thank you please", ["gracias", "por favor", "bienvenidos", "encantado"], ["gracias", "por favor"]),
          s("bienvenidos y encantado", "welcome and delighted", ["bienvenidos", "y", "encantado", "hasta mañana"], ["bienvenidos", "encantado"]),
        ],
      },
      {
        title: "Family & People Recall",
        description: "The people all around you",
        words: [w("el niño", "the boy"), w("la niña", "the girl"), w("el amigo", "the friend"), w("la familia", "the family"), w("la gente", "the people"), w("el bebé", "the baby")],
        sentences: [
          s("el niño y la niña", "the boy and the girl", ["el niño", "y", "la niña", "el amigo"], ["el niño", "la niña"]),
          s("el amigo y la familia", "the friend and the family", ["el amigo", "y", "la familia", "la gente"], ["el amigo", "la familia"]),
          s("el bebé y la gente", "the baby and the people", ["el bebé", "y", "la gente", "la niña"], ["el bebé", "la gente"]),
        ],
      },
      {
        title: "Meals Recall",
        description: "Apples, rice, fruit, and salad",
        words: [w("la manzana", "the apple"), w("el arroz", "the rice"), w("el huevo", "the egg"), w("la fruta", "the fruit"), w("la verdura", "the vegetable"), w("la ensalada", "the salad")],
        sentences: [
          s("la manzana y la fruta", "the apple and the fruit", ["la manzana", "y", "la fruta", "el arroz"], ["la manzana", "la fruta"]),
          s("el arroz y el huevo", "the rice and the egg", ["el arroz", "y", "el huevo", "la verdura"], ["el arroz", "el huevo"]),
          s("la ensalada y la verdura", "the salad and the vegetable", ["la ensalada", "y", "la verdura", "la fruta"], ["la ensalada", "la verdura"]),
        ],
      },
      {
        title: "Drinks & Home Recall",
        description: "Tea, milk, doors, and windows",
        words: [w("el té", "the tea"), w("el jugo", "the juice"), w("la leche", "the milk"), w("la puerta", "the door"), w("la mesa", "the table"), w("la ventana", "the window")],
        sentences: [
          s("el té y el jugo", "the tea and the juice", ["el té", "y", "el jugo", "la leche"], ["el té", "el jugo"]),
          s("la leche y el agua", "the milk and the water", ["la leche", "y", "el agua", "el jugo"], ["la leche", "el agua"]),
          s("la puerta y la ventana", "the door and the window", ["la puerta", "y", "la ventana", "la mesa"], ["la puerta", "la ventana"]),
        ],
      },
    ],
  },
  // ==================== L3 · BUILDING SENTENCES ====================
  {
    id: "section-l3-2",
    title: "Building Sentences — Level 3",
    description: "Type it from memory: family, clothing, time, and weather",
    fillBlank: true,
    units: [
      {
        title: "Family Recall",
        description: "Parents to cousins, typed out",
        words: [w("el padre", "the father"), w("la madre", "the mother"), w("el abuelo", "the grandfather"), w("la abuela", "the grandmother"), w("el tío", "the uncle"), w("el primo", "the cousin")],
        sentences: [
          s("el padre y el abuelo", "the father and the grandfather", ["el padre", "y", "el abuelo", "el tío"], ["el padre", "el abuelo"]),
          s("la madre y la abuela", "the mother and the grandmother", ["la madre", "y", "la abuela", "el primo"], ["la madre", "la abuela"]),
          s("el tío y el primo", "the uncle and the cousin", ["el tío", "y", "el primo", "el abuelo"], ["el tío", "el primo"]),
        ],
      },
      {
        title: "Clothing Recall",
        description: "From shirts to scarves",
        words: [w("la camisa", "the shirt"), w("los zapatos", "the shoes"), w("el abrigo", "the coat"), w("las botas", "the boots"), w("la bufanda", "the scarf"), w("el sombrero", "the hat")],
        sentences: [
          s("la camisa y el abrigo", "the shirt and the coat", ["la camisa", "y", "el abrigo", "las botas"], ["la camisa", "el abrigo"]),
          s("los zapatos y las botas", "the shoes and the boots", ["los zapatos", "y", "las botas", "la bufanda"], ["los zapatos", "las botas"]),
          s("la bufanda y el sombrero", "the scarf and the hat", ["la bufanda", "y", "el sombrero", "el abrigo"], ["la bufanda", "el sombrero"]),
        ],
      },
      {
        title: "Time & Days Recall",
        description: "Hours, minutes, Mondays",
        words: [w("hoy", "today"), w("mañana", "tomorrow"), w("lunes", "Monday"), w("viernes", "Friday"), w("la hora", "the hour"), w("el minuto", "the minute")],
        sentences: [
          s("hoy es lunes", "today is Monday", ["hoy", "es", "lunes", "viernes"], ["hoy", "lunes"]),
          s("mañana es viernes", "tomorrow is Friday", ["mañana", "es", "viernes", "lunes"], ["mañana", "viernes"]),
          s("la hora y el minuto", "the hour and the minute", ["la hora", "y", "el minuto", "hoy"], ["la hora", "el minuto"]),
        ],
      },
      {
        title: "Weather Recall",
        description: "Sun, rain, storms, and clouds",
        words: [w("el sol", "the sun"), w("la lluvia", "the rain"), w("la tormenta", "the storm"), w("la nube", "the cloud"), w("húmedo", "humid"), w("seco", "dry")],
        sentences: [
          s("el sol y la nube", "the sun and the cloud", ["el sol", "y", "la nube", "la lluvia"], ["el sol", "la nube"]),
          s("la lluvia y la tormenta", "the rain and the storm", ["la lluvia", "y", "la tormenta", "la nube"], ["la lluvia", "la tormenta"]),
          s("el día es seco", "the day is dry", ["el día", "es", "seco", "húmedo"], ["el día", "seco"]),
        ],
      },
      {
        title: "Home Family Recall",
        description: "Siblings, children, aunt, and nephew",
        words: [w("el hermano", "the brother"), w("la hermana", "the sister"), w("el hijo", "the son"), w("la hija", "the daughter"), w("la tía", "the aunt"), w("el sobrino", "the nephew")],
        sentences: [
          s("el hermano y la hermana", "the brother and the sister", ["el hermano", "y", "la hermana", "el hijo"], ["el hermano", "la hermana"]),
          s("el hijo y la hija", "the son and the daughter", ["el hijo", "y", "la hija", "la tía"], ["el hijo", "la hija"]),
          s("la tía y el sobrino", "the aunt and the nephew", ["la tía", "y", "el sobrino", "la hermana"], ["la tía", "el sobrino"]),
        ],
      },
      {
        title: "Places Recall",
        description: "City, school, park, and beach",
        words: [w("la ciudad", "the city"), w("la escuela", "the school"), w("la tienda", "the store"), w("el parque", "the park"), w("la playa", "the beach"), w("el mercado", "the market")],
        sentences: [
          s("la ciudad y la escuela", "the city and the school", ["la ciudad", "y", "la escuela", "la tienda"], ["la ciudad", "la escuela"]),
          s("la tienda y el mercado", "the store and the market", ["la tienda", "y", "el mercado", "el parque"], ["la tienda", "el mercado"]),
          s("el parque y la playa", "the park and the beach", ["el parque", "y", "la playa", "la ciudad"], ["el parque", "la playa"]),
        ],
      },
      {
        title: "Action Verbs Recall",
        description: "Read, write, open, close",
        words: [w("yo leo", "I read"), w("yo escribo", "I write"), w("yo estudio", "I study"), w("yo abro", "I open"), w("yo cierro", "I close"), w("yo busco", "I look for")],
        sentences: [
          s("yo leo y yo escribo", "I read and I write", ["yo leo", "y", "yo escribo", "yo estudio"], ["yo leo", "yo escribo"]),
          s("yo estudio mucho", "I study a lot", ["yo estudio", "mucho", "yo leo", "más"], ["yo estudio", "mucho"]),
          s("yo abro y yo cierro", "I open and I close", ["yo abro", "y", "yo cierro", "yo busco"], ["yo abro", "yo cierro"]),
        ],
      },
      {
        title: "Sky & Time Recall",
        description: "Snow, wind, night, and day",
        words: [w("la nieve", "the snow"), w("el viento", "the wind"), w("ayer", "yesterday"), w("ahora", "now"), w("la noche", "the night"), w("el día", "the day")],
        sentences: [
          s("la nieve y el viento", "the snow and the wind", ["la nieve", "y", "el viento", "la noche"], ["la nieve", "el viento"]),
          s("la noche y el día", "the night and the day", ["la noche", "y", "el día", "ahora"], ["la noche", "el día"]),
          s("ayer y ahora", "yesterday and now", ["ayer", "y", "ahora", "el viento"], ["ayer", "ahora"]),
        ],
      },
    ],
  },
  // ==================== L3 · EVERYDAY LIFE ====================
  {
    id: "section-l3-3",
    title: "Everyday Life — Level 3",
    description: "Type it from memory: routines, work, shopping, and cooking",
    fillBlank: true,
    units: [
      {
        title: "Routines Recall",
        description: "Early mornings, typed out",
        words: [w("temprano", "early"), w("tarde", "late"), w("me ducho", "I shower"), w("me visto", "I get dressed"), w("yo duermo", "I sleep"), w("yo descanso", "I rest")],
        sentences: [
          s("me ducho y me visto", "I shower and I get dressed", ["me ducho", "y", "me visto", "yo duermo"], ["me ducho", "me visto"]),
          s("yo duermo temprano", "I sleep early", ["yo duermo", "temprano", "tarde", "yo descanso"], ["yo duermo", "temprano"]),
          s("yo descanso el domingo", "I rest on Sunday", ["yo descanso", "el", "domingo", "temprano"], ["yo descanso", "domingo"]),
        ],
      },
      {
        title: "Work & School Recall",
        description: "Offices, classes, computers, reports",
        words: [w("el trabajo", "the job"), w("la oficina", "the office"), w("la clase", "the class"), w("el libro", "the book"), w("la computadora", "the computer"), w("el informe", "the report")],
        sentences: [
          s("el trabajo y la oficina", "the job and the office", ["el trabajo", "y", "la oficina", "la clase"], ["el trabajo", "la oficina"]),
          s("el libro y la computadora", "the book and the computer", ["el libro", "y", "la computadora", "el informe"], ["el libro", "la computadora"]),
          s("el informe es para la clase", "the report is for the class", ["el informe", "es", "para", "la clase", "la oficina"], ["el informe", "la clase"]),
        ],
      },
      {
        title: "Shopping Recall",
        description: "Buying, paying, discounts",
        words: [w("yo compro", "I buy"), w("yo pago", "I pay"), w("caro", "expensive"), w("barato", "cheap"), w("el descuento", "the discount"), w("la oferta", "the offer")],
        sentences: [
          s("yo compro y yo pago", "I buy and I pay", ["yo compro", "y", "yo pago", "caro"], ["yo compro", "yo pago"]),
          s("el descuento es barato", "the discount is cheap", ["el descuento", "es", "barato", "caro"], ["el descuento", "barato"]),
          s("la oferta no es cara", "the offer is not expensive", ["la oferta", "no", "es", "cara", "barato"], ["la oferta", "no", "caro"]),
        ],
      },
      {
        title: "Kitchen Recall",
        description: "Salt, pepper, oil, and recipes",
        words: [w("yo cocino", "I cook"), w("la sopa", "the soup"), w("la sal", "the salt"), w("la pimienta", "the pepper"), w("el aceite", "the oil"), w("la receta", "the recipe")],
        sentences: [
          s("yo cocino la sopa", "I cook the soup", ["yo cocino", "la sopa", "la sal", "la receta"], ["yo cocino", "la sopa"]),
          s("la sal y la pimienta", "the salt and the pepper", ["la sal", "y", "la pimienta", "el aceite"], ["la sal", "la pimienta"]),
          s("la receta necesita el aceite", "the recipe needs the oil", ["la receta", "necesita", "el aceite", "la pimienta"], ["la receta", "el aceite"]),
        ],
      },
      {
        title: "Workplace Recall",
        description: "Bosses, meetings, mail, and desks",
        words: [w("el jefe", "the boss"), w("la reunión", "the meeting"), w("el proyecto", "the project"), w("el correo", "the mail"), w("la impresora", "the printer"), w("el escritorio", "the desk")],
        sentences: [
          s("el jefe y la reunión", "the boss and the meeting", ["el jefe", "y", "la reunión", "el proyecto"], ["el jefe", "la reunión"]),
          s("el correo y la impresora", "the mail and the printer", ["el correo", "y", "la impresora", "el escritorio"], ["el correo", "la impresora"]),
          s("el proyecto y el escritorio", "the project and the desk", ["el proyecto", "y", "el escritorio", "el jefe"], ["el proyecto", "el escritorio"]),
        ],
      },
      {
        title: "School & Money Recall",
        description: "Teachers, exams, banks, and cards",
        words: [w("el maestro", "the teacher"), w("la tarea", "the homework"), w("el examen", "the exam"), w("el dinero", "the money"), w("el banco", "the bank"), w("la tarjeta", "the card")],
        sentences: [
          s("el maestro y la tarea", "the teacher and the homework", ["el maestro", "y", "la tarea", "el examen"], ["el maestro", "la tarea"]),
          s("el dinero y el banco", "the money and the bank", ["el dinero", "y", "el banco", "la tarjeta"], ["el dinero", "el banco"]),
          s("el examen y la tarjeta", "the exam and the card", ["el examen", "y", "la tarjeta", "el maestro"], ["el examen", "la tarjeta"]),
        ],
      },
      {
        title: "Kitchen Tools Recall",
        description: "Knives, cups, glasses, and ovens",
        words: [w("el cuchillo", "the knife"), w("la taza", "the cup"), w("el vaso", "the glass"), w("el horno", "the oven"), w("el ingrediente", "the ingredient"), w("el azúcar", "the sugar")],
        sentences: [
          s("el cuchillo y el vaso", "the knife and the glass", ["el cuchillo", "y", "el vaso", "la taza"], ["el cuchillo", "el vaso"]),
          s("la taza y el horno", "the cup and the oven", ["la taza", "y", "el horno", "el ingrediente"], ["la taza", "el horno"]),
          s("el ingrediente y el azúcar", "the ingredient and the sugar", ["el ingrediente", "y", "el azúcar", "el horno"], ["el ingrediente", "el azúcar"]),
        ],
      },
      {
        title: "Hobbies & Sports Recall",
        description: "Sing, dance, run, and win",
        words: [w("yo canto", "I sing"), w("yo bailo", "I dance"), w("yo juego", "I play"), w("yo corro", "I run"), w("yo nado", "I swim"), w("yo gano", "I win")],
        sentences: [
          s("yo canto y yo bailo", "I sing and I dance", ["yo canto", "y", "yo bailo", "yo juego"], ["yo canto", "yo bailo"]),
          s("yo corro y yo nado", "I run and I swim", ["yo corro", "y", "yo nado", "yo gano"], ["yo corro", "yo nado"]),
          s("yo juego y yo gano", "I play and I win", ["yo juego", "y", "yo gano", "yo canto"], ["yo juego", "yo gano"]),
        ],
      },
    ],
  },
  // ==================== L3 · GETTING AROUND ====================
  {
    id: "section-l3-4",
    title: "Getting Around — Level 3",
    description: "Type it from memory: streets, travel, hotels, and nature",
    fillBlank: true,
    units: [
      {
        title: "Directions Recall",
        description: "Streets, corners, near and far",
        words: [w("la calle", "the street"), w("cerca", "near"), w("lejos", "far"), w("la esquina", "the corner"), w("el mapa", "the map"), w("la avenida", "the avenue")],
        sentences: [
          s("la calle y la avenida", "the street and the avenue", ["la calle", "y", "la avenida", "la esquina"], ["la calle", "la avenida"]),
          s("la esquina está cerca", "the corner is near", ["la esquina", "está", "cerca", "lejos"], ["la esquina", "cerca"]),
          s("el parque está lejos", "the park is far", ["el parque", "está", "lejos", "cerca"], ["el parque", "lejos"]),
        ],
      },
      {
        title: "Travel Recall",
        description: "Trains, planes, subways, taxis",
        words: [w("el tren", "the train"), w("el avión", "the airplane"), w("el metro", "the subway"), w("el taxi", "the taxi"), w("el boleto", "the ticket"), w("el pasajero", "the passenger")],
        sentences: [
          s("el tren y el metro", "the train and the subway", ["el tren", "y", "el metro", "el taxi"], ["el tren", "el metro"]),
          s("el pasajero tiene el boleto", "the passenger has the ticket", ["el pasajero", "tiene", "el boleto", "el avión"], ["el pasajero", "el boleto"]),
          s("el avión y el taxi", "the airplane and the taxi", ["el avión", "y", "el taxi", "el tren"], ["el avión", "el taxi"]),
        ],
      },
      {
        title: "Hotel Recall",
        description: "Keys, suitcases, elevators, pillows",
        words: [w("el hotel", "the hotel"), w("la llave", "the key"), w("la maleta", "the suitcase"), w("la recepción", "the front desk"), w("el ascensor", "the elevator"), w("la almohada", "the pillow")],
        sentences: [
          s("el hotel y la recepción", "the hotel and the front desk", ["el hotel", "y", "la recepción", "el ascensor"], ["el hotel", "la recepción"]),
          s("la llave y la maleta", "the key and the suitcase", ["la llave", "y", "la maleta", "la almohada"], ["la llave", "la maleta"]),
          s("yo necesito la almohada", "I need the pillow", ["yo necesito", "la almohada", "la llave", "el ascensor"], ["yo necesito", "la almohada"]),
        ],
      },
      {
        title: "Nature Recall",
        description: "Trees, rivers, forests, and lakes",
        words: [w("el árbol", "the tree"), w("la flor", "the flower"), w("el río", "the river"), w("el bosque", "the forest"), w("el lago", "the lake"), w("la isla", "the island")],
        sentences: [
          s("el árbol y la flor", "the tree and the flower", ["el árbol", "y", "la flor", "el río"], ["el árbol", "la flor"]),
          s("el río y el lago", "the river and the lake", ["el río", "y", "el lago", "el bosque"], ["el río", "el lago"]),
          s("el bosque y la isla", "the forest and the island", ["el bosque", "y", "la isla", "el lago"], ["el bosque", "la isla"]),
        ],
      },
      {
        title: "Town Landmarks Recall",
        description: "Buildings, museums, bridges, squares",
        words: [w("el edificio", "the building"), w("el museo", "the museum"), w("la iglesia", "the church"), w("el puente", "the bridge"), w("la plaza", "the square"), w("el centro", "downtown")],
        sentences: [
          s("el edificio y el museo", "the building and the museum", ["el edificio", "y", "el museo", "la iglesia"], ["el edificio", "el museo"]),
          s("la iglesia y el puente", "the church and the bridge", ["la iglesia", "y", "el puente", "la plaza"], ["la iglesia", "el puente"]),
          s("la plaza y el centro", "the square and downtown", ["la plaza", "y", "el centro", "el museo"], ["la plaza", "el centro"]),
        ],
      },
      {
        title: "At the Airport Recall",
        description: "Flights, passports, and luggage",
        words: [w("el aeropuerto", "the airport"), w("el vuelo", "the flight"), w("el pasaporte", "the passport"), w("el equipaje", "the luggage"), w("la salida", "the departure"), w("la llegada", "the arrival")],
        sentences: [
          s("el aeropuerto y el vuelo", "the airport and the flight", ["el aeropuerto", "y", "el vuelo", "el pasaporte"], ["el aeropuerto", "el vuelo"]),
          s("el pasaporte y el equipaje", "the passport and the luggage", ["el pasaporte", "y", "el equipaje", "la salida"], ["el pasaporte", "el equipaje"]),
          s("la salida y la llegada", "the departure and the arrival", ["la salida", "y", "la llegada", "el vuelo"], ["la salida", "la llegada"]),
        ],
      },
      {
        title: "Meals Out Recall",
        description: "Breakfast, lunch, dessert, and tips",
        words: [w("el desayuno", "the breakfast"), w("el almuerzo", "the lunch"), w("el postre", "the dessert"), w("la propina", "the tip"), w("el aperitivo", "the appetizer"), w("la especialidad", "the specialty")],
        sentences: [
          s("el desayuno y el almuerzo", "the breakfast and the lunch", ["el desayuno", "y", "el almuerzo", "el postre"], ["el desayuno", "el almuerzo"]),
          s("el postre y la propina", "the dessert and the tip", ["el postre", "y", "la propina", "el aperitivo"], ["el postre", "la propina"]),
          s("el aperitivo y la especialidad", "the appetizer and the specialty", ["el aperitivo", "y", "la especialidad", "el almuerzo"], ["el aperitivo", "la especialidad"]),
        ],
      },
      {
        title: "Nature & Seasons Recall",
        description: "Mountains, sea, summer, and winter",
        words: [w("la montaña", "the mountain"), w("el mar", "the sea"), w("el cielo", "the sky"), w("el verano", "the summer"), w("el invierno", "the winter"), w("la primavera", "the spring")],
        sentences: [
          s("la montaña y el mar", "the mountain and the sea", ["la montaña", "y", "el mar", "el cielo"], ["la montaña", "el mar"]),
          s("el cielo y el verano", "the sky and the summer", ["el cielo", "y", "el verano", "el invierno"], ["el cielo", "el verano"]),
          s("la primavera y el invierno", "the spring and the winter", ["la primavera", "y", "el invierno", "el mar"], ["la primavera", "el invierno"]),
        ],
      },
    ],
  },
  // ==================== L3 · PAST & FUTURE ====================
  {
    id: "section-l3-5",
    title: "Past & Future — Level 3",
    description: "Type it from memory: past tense, future tense, dreams, and stories",
    fillBlank: true,
    units: [
      {
        title: "Past Recall",
        description: "I went, I ate, I saw — typed",
        words: [w("yo fui", "I went"), w("yo comí", "I ate"), w("yo vi", "I saw"), w("yo dije", "I said"), w("yo vine", "I came"), w("anoche", "last night")],
        sentences: [
          s("yo fui a la playa", "I went to the beach", ["yo fui", "a", "la playa", "yo vine"], ["yo fui", "la playa"]),
          s("anoche yo comí mucho", "last night I ate a lot", ["anoche", "yo comí", "mucho", "yo vi"], ["anoche", "yo comí", "mucho"]),
          s("yo vi y yo dije", "I saw and I said", ["yo vi", "y", "yo dije", "yo fui"], ["yo vi", "yo dije"]),
        ],
      },
      {
        title: "Future Recall",
        description: "I will go, I will be, I will have",
        words: [w("yo iré", "I will go"), w("yo seré", "I will be"), w("yo tendré", "I will have"), w("pronto", "soon"), w("después", "later"), w("el futuro", "the future")],
        sentences: [
          s("yo iré pronto", "I will go soon", ["yo iré", "pronto", "después", "yo seré"], ["yo iré", "pronto"]),
          s("yo tendré una casa", "I will have a house", ["yo tendré", "una", "casa", "el futuro"], ["yo tendré", "la casa"]),
          s("el futuro es después", "the future is later", ["el futuro", "es", "después", "pronto"], ["el futuro", "después"]),
        ],
      },
      {
        title: "Dreams Recall",
        description: "Goals, hope, effort, success",
        words: [w("el sueño", "the dream"), w("la meta", "the goal"), w("la esperanza", "the hope"), w("el éxito", "the success"), w("el esfuerzo", "the effort"), w("el talento", "the talent")],
        sentences: [
          s("el sueño y la meta", "the dream and the goal", ["el sueño", "y", "la meta", "el éxito"], ["el sueño", "la meta"]),
          s("la esperanza y el esfuerzo", "the hope and the effort", ["la esperanza", "y", "el esfuerzo", "el talento"], ["la esperanza", "el esfuerzo"]),
          s("el talento y el éxito", "the talent and the success", ["el talento", "y", "el éxito", "la meta"], ["el talento", "el éxito"]),
        ],
      },
      {
        title: "Stories Recall",
        description: "Heroes, magic, legends, treasure",
        words: [w("el cuento", "the story"), w("el héroe", "the hero"), w("la magia", "the magic"), w("la leyenda", "the legend"), w("el dragón", "the dragon"), w("el tesoro", "the treasure")],
        sentences: [
          s("el cuento y la leyenda", "the story and the legend", ["el cuento", "y", "la leyenda", "la magia"], ["el cuento", "la leyenda"]),
          s("el héroe y el dragón", "the hero and the dragon", ["el héroe", "y", "el dragón", "el tesoro"], ["el héroe", "el dragón"]),
          s("la magia y el tesoro", "the magic and the treasure", ["la magia", "y", "el tesoro", "el héroe"], ["la magia", "el tesoro"]),
        ],
      },
      {
        title: "Past Actions Recall",
        description: "I drank, made, had, put, left, gave",
        words: [w("yo bebí", "I drank"), w("yo hice", "I made"), w("yo tuve", "I had"), w("yo puse", "I put"), w("yo salí", "I left"), w("yo di", "I gave")],
        sentences: [
          s("yo bebí mucho", "I drank a lot", ["yo bebí", "mucho", "yo hice", "más"], ["yo bebí", "mucho"]),
          s("yo hice y yo tuve", "I made and I had", ["yo hice", "y", "yo tuve", "yo puse"], ["yo hice", "yo tuve"]),
          s("yo puse y yo di", "I put and I gave", ["yo puse", "y", "yo di", "yo salí"], ["yo puse", "yo di"]),
        ],
      },
      {
        title: "Last Week Recall",
        description: "Weeks, months, and what you did",
        words: [w("la semana", "the week"), w("el mes", "the month"), w("yo hablé", "I spoke"), w("yo trabajé", "I worked"), w("yo estudié", "I studied"), w("anteayer", "the day before yesterday")],
        sentences: [
          s("la semana y el mes", "the week and the month", ["la semana", "y", "el mes", "anteayer"], ["la semana", "el mes"]),
          s("yo hablé y yo trabajé", "I spoke and I worked", ["yo hablé", "y", "yo trabajé", "yo estudié"], ["yo hablé", "yo trabajé"]),
          s("yo estudié anteayer", "I studied the day before yesterday", ["yo estudié", "anteayer", "yo hablé", "la semana"], ["yo estudié", "anteayer"]),
        ],
      },
      {
        title: "Childhood Recall",
        description: "Young, old, and how it used to be",
        words: [w("la infancia", "the childhood"), w("joven", "young"), w("viejo", "old"), w("yo era", "I used to be"), w("yo jugaba", "I used to play"), w("yo vivía", "I used to live")],
        sentences: [
          s("yo era joven", "I used to be young", ["yo era", "joven", "viejo", "yo vivía"], ["yo era", "joven"]),
          s("yo jugaba y yo vivía", "I used to play and I used to live", ["yo jugaba", "y", "yo vivía", "la infancia"], ["yo jugaba", "yo vivía"]),
          s("el hombre es viejo", "the man is old", ["el hombre", "es", "viejo", "joven"], ["el hombre", "viejo"]),
        ],
      },
      {
        title: "Opinions Recall",
        description: "Think, believe, reasons, the world",
        words: [w("yo pienso", "I think"), w("yo creo", "I believe"), w("la opinión", "the opinion"), w("la razón", "the reason"), w("el mundo", "the world"), w("importante", "important")],
        sentences: [
          s("yo pienso y yo creo", "I think and I believe", ["yo pienso", "y", "yo creo", "la opinión"], ["yo pienso", "yo creo"]),
          s("la opinión y la razón", "the opinion and the reason", ["la opinión", "y", "la razón", "el mundo"], ["la opinión", "la razón"]),
          s("el mundo es importante", "the world is important", ["el mundo", "es", "importante", "la razón"], ["el mundo", "importante"]),
        ],
      },
    ],
  },
  // ==================== L3 · CONVERSATIONS ====================
  {
    id: "section-l3-6",
    title: "Conversations — Level 3",
    description: "Type it from memory: small talk, descriptions, feelings, kindness",
    fillBlank: true,
    units: [
      {
        title: "Small Talk Recall",
        description: "Nice to meet you — spell it out",
        words: [w("muy bien", "very well"), w("mucho gusto", "nice to meet you"), w("hasta luego", "see you later"), w("me llamo", "my name is"), w("el nombre", "the name"), w("el apellido", "the last name")],
        sentences: [
          s("mucho gusto me llamo Ana", "nice to meet you my name is Ana", ["mucho gusto", "me llamo", "Ana", "hasta luego"], ["mucho gusto", "me llamo"]),
          s("muy bien gracias", "very well thank you", ["muy bien", "gracias", "hasta luego", "mucho gusto"], ["muy bien", "gracias"]),
          s("el nombre y el apellido", "the name and the last name", ["el nombre", "y", "el apellido", "me llamo"], ["el nombre", "el apellido"]),
        ],
      },
      {
        title: "Descriptions Recall",
        description: "Tall, thin, blond, strong",
        words: [w("alto", "tall"), w("grande", "big"), w("pequeño", "small"), w("delgado", "thin"), w("rubio", "blond"), w("fuerte", "strong")],
        sentences: [
          s("el hombre es alto y fuerte", "the man is tall and strong", ["el hombre", "es", "alto", "y", "fuerte", "delgado"], ["el hombre", "alto", "fuerte"]),
          s("el niño es rubio y pequeño", "the boy is blond and small", ["el niño", "es", "rubio", "y", "pequeño", "grande"], ["el niño", "rubio", "pequeño"]),
          s("la casa es grande", "the house is big", ["la casa", "es", "grande", "pequeño"], ["la casa", "grande"]),
        ],
      },
      {
        title: "Feelings Recall",
        description: "Happy, nervous, calm — typed",
        words: [w("feliz", "happy"), w("triste", "sad"), w("cansado", "tired"), w("emocionado", "excited"), w("nervioso", "nervous"), w("tranquilo", "calm")],
        sentences: [
          s("yo estoy feliz y emocionado", "I am happy and excited", ["yo estoy", "feliz", "y", "emocionado", "triste"], ["yo estoy", "feliz", "emocionado"]),
          s("él está cansado y triste", "he is tired and sad", ["él está", "cansado", "y", "triste", "nervioso"], ["él está", "cansado", "triste"]),
          s("tranquilo no nervioso", "calm not nervous", ["tranquilo", "no", "nervioso", "feliz"], ["tranquilo", "no", "nervioso"]),
        ],
      },
      {
        title: "Kindness Recall",
        description: "Help, advice, promises, respect",
        words: [w("la ayuda", "the help"), w("el consejo", "the advice"), w("el favor", "the favor"), w("la promesa", "the promise"), w("el respeto", "the respect"), w("el abrazo", "the hug")],
        sentences: [
          s("la ayuda y el consejo", "the help and the advice", ["la ayuda", "y", "el consejo", "el favor"], ["la ayuda", "el consejo"]),
          s("el favor y la promesa", "the favor and the promise", ["el favor", "y", "la promesa", "el respeto"], ["el favor", "la promesa"]),
          s("el respeto y el abrazo", "the respect and the hug", ["el respeto", "y", "el abrazo", "el consejo"], ["el respeto", "el abrazo"]),
        ],
      },
      {
        title: "Plans & Phone Recall",
        description: "Parties, weekends, and calls",
        words: [w("la fiesta", "the party"), w("el fin de semana", "the weekend"), w("la invitación", "the invitation"), w("el teléfono", "the phone"), w("el mensaje", "the message"), w("la llamada", "the call")],
        sentences: [
          s("la fiesta y el fin de semana", "the party and the weekend", ["la fiesta", "y", "el fin de semana", "la invitación"], ["la fiesta", "el fin de semana"]),
          s("la invitación y el teléfono", "the invitation and the phone", ["la invitación", "y", "el teléfono", "el mensaje"], ["la invitación", "el teléfono"]),
          s("el mensaje y la llamada", "the message and the call", ["el mensaje", "y", "la llamada", "la fiesta"], ["el mensaje", "la llamada"]),
        ],
      },
      {
        title: "Personality Recall",
        description: "Kind, funny, smart, brave",
        words: [w("amable", "kind"), w("divertido", "funny"), w("serio", "serious"), w("inteligente", "intelligent"), w("tímido", "shy"), w("valiente", "brave")],
        sentences: [
          s("el amigo es amable", "the friend is kind", ["el amigo", "es", "amable", "serio"], ["el amigo", "amable"]),
          s("el niño es divertido", "the boy is funny", ["el niño", "es", "divertido", "tímido"], ["el niño", "divertido"]),
          s("inteligente y valiente", "intelligent and brave", ["inteligente", "y", "valiente", "serio"], ["inteligente", "valiente"]),
        ],
      },
      {
        title: "Relationships Recall",
        description: "Boyfriends, spouses, love, couples",
        words: [w("el novio", "the boyfriend"), w("la novia", "the girlfriend"), w("el esposo", "the husband"), w("la esposa", "the wife"), w("el amor", "the love"), w("la pareja", "the couple")],
        sentences: [
          s("el novio y la novia", "the boyfriend and the girlfriend", ["el novio", "y", "la novia", "el esposo"], ["el novio", "la novia"]),
          s("el esposo y la esposa", "the husband and the wife", ["el esposo", "y", "la esposa", "el amor"], ["el esposo", "la esposa"]),
          s("el amor y la pareja", "the love and the couple", ["el amor", "y", "la pareja", "la novia"], ["el amor", "la pareja"]),
        ],
      },
      {
        title: "Politeness Recall",
        description: "Pardon, sorry, of course",
        words: [w("perdón", "pardon"), w("lo siento", "I'm sorry"), w("con permiso", "excuse me"), w("de nada", "you're welcome"), w("claro", "of course"), w("el saludo", "the greeting")],
        sentences: [
          s("perdón y lo siento", "pardon and I'm sorry", ["perdón", "y", "lo siento", "con permiso"], ["perdón", "lo siento"]),
          s("de nada claro", "you're welcome of course", ["de nada", "claro", "con permiso", "perdón"], ["de nada", "claro"]),
          s("el saludo es cortés", "the greeting is polite", ["el saludo", "es", "cortés", "claro"], ["el saludo", "cortés"]),
        ],
      },
    ],
  },
  // ==================== L3 · THE WIDER WORLD ====================
  {
    id: "section-l3-7",
    title: "The Wider World — Level 3",
    description: "Type it from memory: countries, culture, media, and the planet",
    fillBlank: true,
    units: [
      {
        title: "Countries Recall",
        description: "Spain to Peru, typed out",
        words: [w("España", "Spain"), w("México", "Mexico"), w("Argentina", "Argentina"), w("Perú", "Peru"), w("el país", "the country"), w("la capital", "the capital")],
        sentences: [
          s("España y México", "Spain and Mexico", ["España", "y", "México", "Argentina"], ["España", "México"]),
          s("Argentina y Perú", "Argentina and Peru", ["Argentina", "y", "Perú", "España"], ["Argentina", "Perú"]),
          s("la capital de el país", "the capital of the country", ["la capital", "de", "el país", "México"], ["la capital", "el país"]),
        ],
      },
      {
        title: "Culture Recall",
        description: "Traditions, festivals, songs, theaters",
        words: [w("la cultura", "the culture"), w("la tradición", "the tradition"), w("el festival", "the festival"), w("la canción", "the song"), w("el músico", "the musician"), w("el teatro", "the theater")],
        sentences: [
          s("la cultura y la tradición", "the culture and the tradition", ["la cultura", "y", "la tradición", "el festival"], ["la cultura", "la tradición"]),
          s("el músico y la canción", "the musician and the song", ["el músico", "y", "la canción", "el teatro"], ["el músico", "la canción"]),
          s("el festival y el teatro", "the festival and the theater", ["el festival", "y", "el teatro", "la canción"], ["el festival", "el teatro"]),
        ],
      },
      {
        title: "Media Recall",
        description: "Movies, magazines, novels, authors",
        words: [w("la película", "the movie"), w("el actor", "the actor"), w("la revista", "the magazine"), w("el artículo", "the article"), w("la novela", "the novel"), w("el autor", "the author")],
        sentences: [
          s("la película y el actor", "the movie and the actor", ["la película", "y", "el actor", "la revista"], ["la película", "el actor"]),
          s("la revista y el artículo", "the magazine and the article", ["la revista", "y", "el artículo", "la novela"], ["la revista", "el artículo"]),
          s("el autor y la novela", "the author and the novel", ["el autor", "y", "la novela", "el artículo"], ["el autor", "la novela"]),
        ],
      },
      {
        title: "Planet Recall",
        description: "Earth, climate, jungles, recycling",
        words: [w("la tierra", "the earth"), w("el clima", "the climate"), w("la selva", "the jungle"), w("la contaminación", "the pollution"), w("el reciclaje", "the recycling"), w("limpio", "clean")],
        sentences: [
          s("la tierra y el clima", "the earth and the climate", ["la tierra", "y", "el clima", "la selva"], ["la tierra", "el clima"]),
          s("la selva es limpia", "the jungle is clean", ["la selva", "es", "limpia", "la contaminación"], ["la selva", "limpio"]),
          s("el reciclaje y la contaminación", "the recycling and the pollution", ["el reciclaje", "y", "la contaminación", "el clima"], ["el reciclaje", "la contaminación"]),
        ],
      },
      {
        title: "Languages Recall",
        description: "Spanish, English, words, sentences",
        words: [w("el español", "Spanish (language)"), w("el inglés", "English (language)"), w("la palabra", "the word"), w("la frase", "the sentence"), w("yo aprendo", "I learn"), w("yo entiendo", "I understand")],
        sentences: [
          s("el español y el inglés", "Spanish and English", ["el español", "y", "el inglés", "la palabra"], ["el español", "el inglés"]),
          s("la palabra y la frase", "the word and the sentence", ["la palabra", "y", "la frase", "yo aprendo"], ["la palabra", "la frase"]),
          s("yo aprendo y yo entiendo", "I learn and I understand", ["yo aprendo", "y", "yo entiendo", "el inglés"], ["yo aprendo", "yo entiendo"]),
        ],
      },
      {
        title: "Instruments Recall",
        description: "Piano, violin, trumpet, guitar",
        words: [w("el piano", "the piano"), w("el violín", "the violin"), w("la trompeta", "the trumpet"), w("el tambor", "the drum"), w("la flauta", "the flute"), w("la guitarra", "the guitar")],
        sentences: [
          s("el piano y el violín", "the piano and the violin", ["el piano", "y", "el violín", "la trompeta"], ["el piano", "el violín"]),
          s("la trompeta y el tambor", "the trumpet and the drum", ["la trompeta", "y", "el tambor", "la flauta"], ["la trompeta", "el tambor"]),
          s("la flauta y la guitarra", "the flute and the guitar", ["la flauta", "y", "la guitarra", "el piano"], ["la flauta", "la guitarra"]),
        ],
      },
      {
        title: "Screen & Stage Recall",
        description: "Television, actress, stage, audience",
        words: [w("la televisión", "the television"), w("la actriz", "the actress"), w("la pantalla", "the screen"), w("el escenario", "the stage"), w("el público", "the audience"), w("el aplauso", "the applause")],
        sentences: [
          s("la televisión y la pantalla", "the television and the screen", ["la televisión", "y", "la pantalla", "la actriz"], ["la televisión", "la pantalla"]),
          s("la actriz y el escenario", "the actress and the stage", ["la actriz", "y", "el escenario", "el público"], ["la actriz", "el escenario"]),
          s("el público y el aplauso", "the audience and the applause", ["el público", "y", "el aplauso", "la pantalla"], ["el público", "el aplauso"]),
        ],
      },
      {
        title: "Geography Recall",
        description: "Continents, oceans, borders, war",
        words: [w("el continente", "the continent"), w("el océano", "the ocean"), w("la región", "the region"), w("la frontera", "the border"), w("la guerra", "the war"), w("la paz", "the peace")],
        sentences: [
          s("el continente y el océano", "the continent and the ocean", ["el continente", "y", "el océano", "la región"], ["el continente", "el océano"]),
          s("la región y la frontera", "the region and the border", ["la región", "y", "la frontera", "la guerra"], ["la región", "la frontera"]),
          s("la guerra y la paz", "the war and the peace", ["la guerra", "y", "la paz", "el océano"], ["la guerra", "la paz"]),
        ],
      },
    ],
  },
  // ==================== L3 · MASTERY ====================
  {
    id: "section-l3-8",
    title: "Mastery — Level 3",
    description: "Type it from memory: emotions, business, ideas, and society",
    fillBlank: true,
    units: [
      {
        title: "Emotions Recall",
        description: "Pride, joy, fear, relief",
        words: [w("orgulloso", "proud"), w("agradecido", "grateful"), w("la alegría", "the joy"), w("el miedo", "the fear"), w("la nostalgia", "the nostalgia"), w("el alivio", "the relief")],
        sentences: [
          s("yo estoy orgulloso y agradecido", "I am proud and grateful", ["yo estoy", "orgulloso", "y", "agradecido", "el miedo"], ["yo estoy", "orgulloso", "agradecido"]),
          s("la alegría y el alivio", "the joy and the relief", ["la alegría", "y", "el alivio", "la nostalgia"], ["la alegría", "el alivio"]),
          s("el miedo y la nostalgia", "the fear and the nostalgia", ["el miedo", "y", "la nostalgia", "el alivio"], ["el miedo", "la nostalgia"]),
        ],
      },
      {
        title: "Work Life Recall",
        description: "Careers, salaries, contracts, profits",
        words: [w("la carrera", "the career"), w("el sueldo", "the salary"), w("la empresa", "the company"), w("el negocio", "the business"), w("la ganancia", "the profit"), w("el contrato", "the contract")],
        sentences: [
          s("la carrera y el sueldo", "the career and the salary", ["la carrera", "y", "el sueldo", "la empresa"], ["la carrera", "el sueldo"]),
          s("la empresa y el negocio", "the company and the business", ["la empresa", "y", "el negocio", "el contrato"], ["la empresa", "el negocio"]),
          s("el contrato y la ganancia", "the contract and the profit", ["el contrato", "y", "la ganancia", "el sueldo"], ["el contrato", "la ganancia"]),
        ],
      },
      {
        title: "Ideas Recall",
        description: "Mind, wisdom, purpose, reality",
        words: [w("la mente", "the mind"), w("el conocimiento", "the knowledge"), w("la sabiduría", "the wisdom"), w("la filosofía", "the philosophy"), w("el propósito", "the purpose"), w("la realidad", "the reality")],
        sentences: [
          s("la mente y el conocimiento", "the mind and the knowledge", ["la mente", "y", "el conocimiento", "la sabiduría"], ["la mente", "el conocimiento"]),
          s("la filosofía y la sabiduría", "the philosophy and the wisdom", ["la filosofía", "y", "la sabiduría", "la realidad"], ["la filosofía", "la sabiduría"]),
          s("el propósito y la realidad", "the purpose and the reality", ["el propósito", "y", "la realidad", "la mente"], ["el propósito", "la realidad"]),
        ],
      },
      {
        title: "Society Recall",
        description: "Law, freedom, justice, votes",
        words: [w("la sociedad", "the society"), w("la ley", "the law"), w("la libertad", "the freedom"), w("la justicia", "the justice"), w("el voto", "the vote"), w("el ciudadano", "the citizen")],
        sentences: [
          s("la sociedad y la ley", "the society and the law", ["la sociedad", "y", "la ley", "la libertad"], ["la sociedad", "la ley"]),
          s("la libertad y la justicia", "the freedom and the justice", ["la libertad", "y", "la justicia", "el voto"], ["la libertad", "la justicia"]),
          s("el ciudadano tiene el voto", "the citizen has the vote", ["el ciudadano", "tiene", "el voto", "la ley"], ["el ciudadano", "el voto"]),
        ],
      },
      {
        title: "Science Recall",
        description: "Experiments, theories, discoveries",
        words: [w("la ciencia", "the science"), w("el experimento", "the experiment"), w("la teoría", "the theory"), w("el descubrimiento", "the discovery"), w("la célula", "the cell"), w("el laboratorio", "the laboratory")],
        sentences: [
          s("la ciencia y la teoría", "the science and the theory", ["la ciencia", "y", "la teoría", "el experimento"], ["la ciencia", "la teoría"]),
          s("el experimento y el laboratorio", "the experiment and the laboratory", ["el experimento", "y", "el laboratorio", "la célula"], ["el experimento", "el laboratorio"]),
          s("el descubrimiento y la célula", "the discovery and the cell", ["el descubrimiento", "y", "la célula", "la teoría"], ["el descubrimiento", "la célula"]),
        ],
      },
      {
        title: "Careers Recall",
        description: "Interviews, clients, partners, profit",
        words: [w("la entrevista", "the interview"), w("el cliente", "the client"), w("exitoso", "successful"), w("la pérdida", "the loss"), w("la inversión", "the investment"), w("el socio", "the partner")],
        sentences: [
          s("la entrevista y el cliente", "the interview and the client", ["la entrevista", "y", "el cliente", "la inversión"], ["la entrevista", "el cliente"]),
          s("la inversión y el socio", "the investment and the partner", ["la inversión", "y", "el socio", "la pérdida"], ["la inversión", "el socio"]),
          s("el negocio es exitoso", "the business is successful", ["el negocio", "es", "exitoso", "la pérdida"], ["el negocio", "exitoso"]),
        ],
      },
      {
        title: "Technology Recall",
        description: "Robots, apps, batteries, signals",
        words: [w("la tecnología", "the technology"), w("el robot", "the robot"), w("la aplicación", "the app"), w("la batería", "the battery"), w("la señal", "the signal"), w("el cargador", "the charger")],
        sentences: [
          s("la tecnología y el robot", "the technology and the robot", ["la tecnología", "y", "el robot", "la aplicación"], ["la tecnología", "el robot"]),
          s("la aplicación y la batería", "the app and the battery", ["la aplicación", "y", "la batería", "la señal"], ["la aplicación", "la batería"]),
          s("la señal y el cargador", "the signal and the charger", ["la señal", "y", "el cargador", "el robot"], ["la señal", "el cargador"]),
        ],
      },
      {
        title: "Debate & Ideas Recall",
        description: "Arguments, points, thoughts, doubts",
        words: [w("el debate", "the debate"), w("el argumento", "the argument"), w("el punto", "the point"), w("la evidencia", "the evidence"), w("el pensamiento", "the thought"), w("la duda", "the doubt")],
        sentences: [
          s("el debate y el argumento", "the debate and the argument", ["el debate", "y", "el argumento", "el punto"], ["el debate", "el argumento"]),
          s("el punto y la evidencia", "the point and the evidence", ["el punto", "y", "la evidencia", "el pensamiento"], ["el punto", "la evidencia"]),
          s("el pensamiento y la duda", "the thought and the doubt", ["el pensamiento", "y", "la duda", "el argumento"], ["el pensamiento", "la duda"]),
        ],
      },
    ],
  },
  // ==================== L3 · VERB CONJUGATION ====================
  {
    id: "section-l3-9",
    title: "Verb Conjugation — Level 3",
    description: "Type every conjugation from memory",
    fillBlank: true,
    units: [
      {
        title: "Hablar & Comer Recall",
        description: "Speaking and eating, all persons",
        words: [w("yo hablo", "I speak"), w("tú hablas", "you speak"), w("ellos hablan", "they speak"), w("yo como", "I eat"), w("tú comes", "you eat"), w("ellos comen", "they eat")],
        sentences: [
          s("yo hablo y yo como", "I speak and I eat", ["yo hablo", "y", "yo como", "tú hablas"], ["yo hablo", "yo como"]),
          s("tú hablas y tú comes", "you speak and you eat", ["tú hablas", "y", "tú comes", "ellos comen"], ["tú hablas", "tú comes"]),
          s("ellos hablan y ellos comen", "they speak and they eat", ["ellos hablan", "y", "ellos comen", "yo como"], ["ellos hablan", "ellos comen"]),
        ],
      },
      {
        title: "Ser & Estar Recall",
        description: "Both to-be verbs, typed",
        words: [w("yo soy", "I am"), w("tú eres", "you are"), w("ellos son", "they are"), w("yo estoy", "I am (feeling)"), w("tú estás", "you are (feeling)"), w("ellos están", "they are (feeling)")],
        sentences: [
          s("yo soy alto y yo estoy feliz", "I am tall and I am happy", ["yo soy", "alto", "y", "yo estoy", "feliz"], ["yo soy", "yo estoy", "alto", "feliz"]),
          s("tú eres mi amigo", "you are my friend", ["tú eres", "mi", "amigo", "tú estás"], ["tú eres", "mi", "el amigo"]),
          s("ellos están cansados", "they are tired", ["ellos están", "cansados", "ellos son", "feliz"], ["ellos están", "cansado"]),
        ],
      },
      {
        title: "Ir & Tener Recall",
        description: "Going and having, all persons",
        words: [w("yo voy", "I go"), w("tú vas", "you go"), w("ellos van", "they go"), w("yo tengo", "I have"), w("tú tienes", "you have"), w("ellos tienen", "they have")],
        sentences: [
          s("yo voy y yo tengo", "I go and I have", ["yo voy", "y", "yo tengo", "tú vas"], ["yo voy", "yo tengo"]),
          s("tú vas a la escuela", "you go to the school", ["tú vas", "a", "la escuela", "ellos van"], ["tú vas", "la escuela"]),
          s("ellos tienen un perro", "they have a dog", ["ellos tienen", "un", "perro", "tú tienes"], ["ellos tienen", "el perro"]),
        ],
      },
      {
        title: "Querer & Poder Recall",
        description: "Wanting and being able, typed",
        words: [w("yo quiero", "I want"), w("tú quieres", "you want"), w("ellos quieren", "they want"), w("yo puedo", "I can"), w("tú puedes", "you can"), w("ellos pueden", "they can")],
        sentences: [
          s("yo quiero y yo puedo", "I want and I can", ["yo quiero", "y", "yo puedo", "tú quieres"], ["yo quiero", "yo puedo"]),
          s("tú quieres más café", "you want more coffee", ["tú quieres", "más", "café", "tú puedes"], ["tú quieres", "más", "el café"]),
          s("ellos pueden y ellos quieren", "they can and they want", ["ellos pueden", "y", "ellos quieren", "yo puedo"], ["ellos pueden", "ellos quieren"]),
        ],
      },
      {
        title: "Vivir & Trabajar Recall",
        description: "To live and to work, all persons",
        words: [w("yo vivo", "I live"), w("ellos viven", "they live"), w("yo trabajo", "I work"), w("ellos trabajan", "they work"), w("nosotros vivimos", "we live"), w("nosotros trabajamos", "we work")],
        sentences: [
          s("yo vivo y yo trabajo", "I live and I work", ["yo vivo", "y", "yo trabajo", "ellos viven"], ["yo vivo", "yo trabajo"]),
          s("nosotros vivimos y nosotros trabajamos", "we live and we work", ["nosotros vivimos", "y", "nosotros trabajamos", "ellos trabajan"], ["nosotros vivimos", "nosotros trabajamos"]),
          s("ellos viven y ellos trabajan", "they live and they work", ["ellos viven", "y", "ellos trabajan", "yo vivo"], ["ellos viven", "ellos trabajan"]),
        ],
      },
      {
        title: "He & We Forms Recall",
        description: "él and nosotros conjugations",
        words: [w("él habla", "he speaks"), w("él come", "he eats"), w("él vive", "he lives"), w("nosotros hablamos", "we speak"), w("nosotros comemos", "we eat"), w("él es", "he is")],
        sentences: [
          s("él habla y él come", "he speaks and he eats", ["él habla", "y", "él come", "él vive"], ["él habla", "él come"]),
          s("nosotros hablamos y nosotros comemos", "we speak and we eat", ["nosotros hablamos", "y", "nosotros comemos", "él es"], ["nosotros hablamos", "nosotros comemos"]),
          s("él vive bien", "he lives well", ["él vive", "bien", "él es", "él habla"], ["él vive", "bien"]),
        ],
      },
      {
        title: "Hacer & Ver Recall",
        description: "To make and to see, all persons",
        words: [w("yo hago", "I make"), w("tú haces", "you make"), w("ellos hacen", "they make"), w("yo veo", "I see"), w("tú ves", "you see"), w("ellos ven", "they see")],
        sentences: [
          s("yo hago y yo veo", "I make and I see", ["yo hago", "y", "yo veo", "tú haces"], ["yo hago", "yo veo"]),
          s("tú haces y tú ves", "you make and you see", ["tú haces", "y", "tú ves", "ellos hacen"], ["tú haces", "tú ves"]),
          s("ellos hacen y ellos ven", "they make and they see", ["ellos hacen", "y", "ellos ven", "yo hago"], ["ellos hacen", "ellos ven"]),
        ],
      },
      {
        title: "Decir & Venir Recall",
        description: "To say and to come, all persons",
        words: [w("yo digo", "I say"), w("tú dices", "you say"), w("ellos dicen", "they say"), w("yo vengo", "I come"), w("tú vienes", "you come"), w("ellos vienen", "they come")],
        sentences: [
          s("yo digo y yo vengo", "I say and I come", ["yo digo", "y", "yo vengo", "tú dices"], ["yo digo", "yo vengo"]),
          s("tú dices y tú vienes", "you say and you come", ["tú dices", "y", "tú vienes", "ellos dicen"], ["tú dices", "tú vienes"]),
          s("ellos dicen y ellos vienen", "they say and they come", ["ellos dicen", "y", "ellos vienen", "yo digo"], ["ellos dicen", "ellos vienen"]),
        ],
      },
    ],
  },
  // ==================== L3 · GRAMMAR ====================
  {
    id: "section-l3-10",
    title: "Grammar — Level 3",
    description: "Type the glue words from memory",
    fillBlank: true,
    units: [
      {
        title: "Articles & Plurals Recall",
        description: "Un, una, and the plurals",
        words: [w("un", "a (masculine)"), w("una", "a (feminine)"), w("un poco", "a little"), w("los libros", "the books"), w("las casas", "the houses"), w("muchos", "many (masculine)")],
        sentences: [
          s("un poco de café", "a little of coffee", ["un poco", "de", "café", "una"], ["un poco", "el café"]),
          s("los libros y las casas", "the books and the houses", ["los libros", "y", "las casas", "muchos"], ["los libros", "las casas"]),
          s("muchos amigos y una casa", "many friends and a house", ["muchos", "amigos", "y", "una", "casa"], ["muchos", "una", "los amigos"]),
        ],
      },
      {
        title: "Negation & Questions Recall",
        description: "Not, nothing, what, where, why",
        words: [w("no", "not"), w("nada", "nothing"), w("nunca", "never"), w("¿qué?", "what?"), w("¿dónde?", "where?"), w("¿por qué?", "why?")],
        sentences: [
          s("yo no como nada", "I do not eat anything", ["yo", "no", "como", "nada", "nunca"], ["no", "nada", "yo como"]),
          s("dónde está el perro", "where is the dog", ["dónde", "está", "el perro", "qué"], ["¿dónde?", "el perro"]),
          s("por qué nunca", "why never", ["por", "qué", "nunca", "nada"], ["¿por qué?", "nunca"]),
        ],
      },
      {
        title: "Little Words Recall",
        description: "In, with, without, my, your, but",
        words: [w("en", "in"), w("con", "with"), w("sin", "without"), w("mi", "my"), w("tu", "your"), w("pero", "but")],
        sentences: [
          s("yo vivo en tu ciudad", "I live in your city", ["yo vivo", "en", "tu", "ciudad", "mi"], ["en", "tu", "yo vivo", "la ciudad"]),
          s("con mi familia", "with my family", ["con", "mi", "familia", "sin"], ["con", "mi", "la familia"]),
          s("sin café pero con té", "without coffee but with tea", ["sin", "café", "pero", "con", "té"], ["sin", "pero", "con", "el café", "el té"]),
        ],
      },
      {
        title: "Comparisons Recall",
        description: "More than, the best, this and that",
        words: [w("más que", "more than"), w("menos que", "less than"), w("el mejor", "the best"), w("el peor", "the worst"), w("este", "this (masculine)"), w("ese", "that (masculine)")],
        sentences: [
          s("este libro es el mejor", "this book is the best", ["este", "libro", "es", "el mejor", "el peor"], ["este", "el mejor", "el libro"]),
          s("ese día es el peor", "that day is the worst", ["ese", "día", "es", "el peor", "el mejor"], ["ese", "el peor", "el día"]),
          s("yo como más que tú", "I eat more than you", ["yo como", "más", "que", "tú", "menos"], ["yo como", "más que"]),
        ],
      },
      {
        title: "Adjective Agreement Recall",
        description: "Good, new, tall, pretty — matched",
        words: [w("bueno", "good (masculine)"), w("buena", "good (feminine)"), w("nuevo", "new (masculine)"), w("nueva", "new (feminine)"), w("alta", "tall (feminine)"), w("bonita", "pretty (feminine)")],
        sentences: [
          s("el libro es bueno", "the book is good", ["el libro", "es", "bueno", "buena"], ["el libro", "bueno"]),
          s("la casa es nueva", "the house is new", ["la casa", "es", "nueva", "nuevo"], ["la casa", "nueva"]),
          s("la niña es bonita", "the girl is pretty", ["la niña", "es", "bonita", "alta"], ["la niña", "bonita"]),
        ],
      },
      {
        title: "More Questions Recall",
        description: "Who, when, how — and the negatives",
        words: [w("¿quién?", "who?"), w("¿cuándo?", "when?"), w("¿cómo?", "how?"), w("nadie", "nobody"), w("tampoco", "neither"), w("todavía no", "not yet")],
        sentences: [
          s("quién y cuándo", "who and when", ["quién", "y", "cuándo", "cómo"], ["¿quién?", "¿cuándo?"]),
          s("nadie y tampoco", "nobody and neither", ["nadie", "y", "tampoco", "todavía no"], ["nadie", "tampoco"]),
          s("cómo y cuándo", "how and when", ["cómo", "y", "cuándo", "quién"], ["¿cómo?", "¿cuándo?"]),
        ],
      },
      {
        title: "Demonstratives Recall",
        description: "This, that, these, those",
        words: [w("este", "this (masculine)"), w("esta", "this (feminine)"), w("ese", "that (masculine)"), w("esa", "that (feminine)"), w("estos", "these"), w("esos", "those")],
        sentences: [
          s("este y ese", "this and that", ["este", "y", "ese", "esta"], ["este", "ese"]),
          s("esta casa es nueva", "this house is new", ["esta", "casa", "es", "nueva", "esa"], ["esta", "la casa", "nueva"]),
          s("estos y esos", "these and those", ["estos", "y", "esos", "este"], ["estos", "esos"]),
        ],
      },
      {
        title: "Connectors Recall",
        description: "Because, although, while, if, or",
        words: [w("porque", "because"), w("aunque", "although"), w("mientras", "while"), w("si", "if"), w("o", "or"), w("casi", "almost")],
        sentences: [
          s("café o té", "coffee or tea", ["café", "o", "té", "si"], ["o", "el café", "el té"]),
          s("yo como porque yo trabajo", "I eat because I work", ["yo como", "porque", "yo trabajo", "aunque"], ["porque", "yo como", "yo trabajo"]),
          s("aunque yo estoy cansado", "although I am tired", ["aunque", "yo estoy", "cansado", "mientras"], ["aunque", "yo estoy", "cansado"]),
        ],
      },
    ],
  },
];
