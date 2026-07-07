// Level 1 course content: sections 1-10 (basics through grammar).

import { w, s, type SectionDef } from "./course-types";

export const level1Sections: SectionDef[] = [
  // ==================== SECTION 1 ====================
  {
    id: "section-1",
    title: "Section 1: Foundations",
    description: "First words, people, food, and the world at home",
    units: [
      {
        title: "Greetings",
        description: "Say hello, goodbye, and thank you",
        words: [w("hola", "hello"), w("adiós", "goodbye"), w("buenos días", "good morning"), w("buenas noches", "good night"), w("gracias", "thank you"), w("por favor", "please")],
        sentences: [
          s("hola buenos días", "hello good morning", ["hola", "buenos días", "adiós", "gracias"], ["hola", "buenos días"]),
          s("gracias y adiós", "thank you and goodbye", ["gracias", "y", "adiós", "por favor"], ["gracias", "adiós"]),
          s("buenas noches y gracias", "good night and thank you", ["buenas noches", "y", "gracias", "hola"], ["buenas noches", "gracias"]),
        ],
      },
      {
        title: "People",
        description: "The man, the woman, the friend",
        words: [w("el hombre", "the man"), w("la mujer", "the woman"), w("el niño", "the boy"), w("la niña", "the girl"), w("el amigo", "the friend"), w("la familia", "the family")],
        sentences: [
          s("el hombre y la mujer", "the man and the woman", ["el hombre", "y", "la mujer", "el niño"], ["el hombre", "la mujer"]),
          s("la niña y el amigo", "the girl and the friend", ["la niña", "y", "el amigo", "la mujer"], ["la niña", "el amigo"]),
          s("el niño y la familia", "the boy and the family", ["el niño", "y", "la familia", "el hombre"], ["el niño", "la familia"]),
        ],
      },
      {
        title: "To Be",
        description: "I am, you are, we are",
        words: [w("yo soy", "I am"), w("tú eres", "you are"), w("él es", "he is"), w("ella es", "she is"), w("nosotros somos", "we are"), w("ellos son", "they are")],
        sentences: [
          s("yo soy el hombre", "I am the man", ["yo soy", "el hombre", "tú eres", "la mujer"], ["yo soy", "el hombre"]),
          s("ella es la niña", "she is the girl", ["ella es", "la niña", "él es", "el niño"], ["ella es", "la niña"]),
          s("nosotros somos la familia", "we are the family", ["nosotros somos", "la familia", "ellos son", "el amigo"], ["nosotros somos", "la familia"]),
        ],
      },
      {
        title: "Food",
        description: "Bread, apples, and what's on the plate",
        words: [w("el pan", "the bread"), w("la manzana", "the apple"), w("el queso", "the cheese"), w("la comida", "the food"), w("el arroz", "the rice"), w("el huevo", "the egg")],
        sentences: [
          s("el pan y el queso", "the bread and the cheese", ["el pan", "y", "el queso", "la manzana"], ["el pan", "el queso"]),
          s("el huevo y el arroz", "the egg and the rice", ["el huevo", "y", "el arroz", "el pan"], ["el huevo", "el arroz"]),
          s("la manzana es la comida", "the apple is the food", ["la manzana", "es", "la comida", "el queso"], ["la manzana", "la comida"]),
        ],
      },
      {
        title: "Drinks",
        description: "Water, coffee, and everything in the glass",
        words: [w("el agua", "the water"), w("el café", "the coffee"), w("el té", "the tea"), w("el jugo", "the juice"), w("la leche", "the milk"), w("el vino", "the wine")],
        sentences: [
          s("el café y la leche", "the coffee and the milk", ["el café", "y", "la leche", "el té"], ["el café", "la leche"]),
          s("el agua y el jugo", "the water and the juice", ["el agua", "y", "el jugo", "el vino"], ["el agua", "el jugo"]),
          s("el vino y el té", "the wine and the tea", ["el vino", "y", "el té", "el agua"], ["el vino", "el té"]),
        ],
      },
      {
        title: "Wants & Needs",
        description: "Want it, eat it, drink it",
        words: [w("yo quiero", "I want"), w("yo como", "I eat"), w("yo bebo", "I drink"), w("yo necesito", "I need"), w("mucho", "a lot"), w("más", "more")],
        sentences: [
          s("yo quiero el pan", "I want the bread", ["yo quiero", "el pan", "yo como", "el agua"], ["yo quiero", "el pan"]),
          s("yo bebo el café", "I drink the coffee", ["yo bebo", "el café", "yo como", "el té"], ["yo bebo", "el café"]),
          s("yo como mucho", "I eat a lot", ["yo como", "mucho", "yo bebo", "más"], ["yo como", "mucho"]),
        ],
      },
      {
        title: "Animals",
        description: "Dogs, cats, and the whole farm",
        words: [w("el perro", "the dog"), w("el gato", "the cat"), w("el caballo", "the horse"), w("el pájaro", "the bird"), w("el pez", "the fish"), w("la vaca", "the cow")],
        sentences: [
          s("el perro y el gato", "the dog and the cat", ["el perro", "y", "el gato", "el pez"], ["el perro", "el gato"]),
          s("el caballo y la vaca", "the horse and the cow", ["el caballo", "y", "la vaca", "el pájaro"], ["el caballo", "la vaca"]),
          s("el pájaro y el pez", "the bird and the fish", ["el pájaro", "y", "el pez", "el gato"], ["el pájaro", "el pez"]),
        ],
      },
      {
        title: "Colors",
        description: "Paint the world in Spanish",
        words: [w("rojo", "red"), w("azul", "blue"), w("verde", "green"), w("amarillo", "yellow"), w("negro", "black"), w("blanco", "white")],
        sentences: [
          s("el perro es negro", "the dog is black", ["el perro", "es", "negro", "blanco"], ["el perro", "negro"]),
          s("el pájaro es rojo", "the bird is red", ["el pájaro", "es", "rojo", "azul"], ["el pájaro", "rojo"]),
          s("el gato es blanco y negro", "the cat is white and black", ["el gato", "es", "blanco", "y", "negro", "verde"], ["el gato", "blanco", "negro"]),
        ],
      },
      {
        title: "Numbers",
        description: "Count from one to ten",
        words: [w("uno", "one"), w("dos", "two"), w("tres", "three"), w("cuatro", "four"), w("cinco", "five"), w("diez", "ten")],
        sentences: [
          s("uno dos y tres", "one two and three", ["uno", "dos", "y", "tres", "cinco"], ["uno", "dos", "tres"]),
          s("cuatro y cinco", "four and five", ["cuatro", "y", "cinco", "diez"], ["cuatro", "cinco"]),
          s("yo necesito diez", "I need ten", ["yo necesito", "diez", "uno", "yo quiero"], ["yo necesito", "diez"]),
        ],
      },
      {
        title: "The Home",
        description: "The house, room by room",
        words: [w("la casa", "the house"), w("la puerta", "the door"), w("la mesa", "the table"), w("la cama", "the bed"), w("la ventana", "the window"), w("la cocina", "the kitchen")],
        sentences: [
          s("la casa y la puerta", "the house and the door", ["la casa", "y", "la puerta", "la mesa"], ["la casa", "la puerta"]),
          s("la mesa es azul", "the table is blue", ["la mesa", "es", "azul", "la cama"], ["la mesa", "azul"]),
          s("yo quiero la cama", "I want the bed", ["yo quiero", "la cama", "la ventana", "la cocina"], ["yo quiero", "la cama"]),
        ],
      },
    ],
  },
  // ==================== SECTION 2 ====================
  {
    id: "section-2",
    title: "Section 2: Building Sentences",
    description: "Verbs, time, feelings, and getting around",
    units: [
      {
        title: "Family",
        description: "Parents, siblings, sons and daughters",
        words: [w("el padre", "the father"), w("la madre", "the mother"), w("el hermano", "the brother"), w("la hermana", "the sister"), w("el hijo", "the son"), w("la hija", "the daughter")],
        sentences: [
          s("el padre y la madre", "the father and the mother", ["el padre", "y", "la madre", "el hijo"], ["el padre", "la madre"]),
          s("el hermano y la hermana", "the brother and the sister", ["el hermano", "y", "la hermana", "la hija"], ["el hermano", "la hermana"]),
          s("el hijo y la hija", "the son and the daughter", ["el hijo", "y", "la hija", "el padre"], ["el hijo", "la hija"]),
        ],
      },
      {
        title: "Clothing",
        description: "Shirts, shoes, and what to wear",
        words: [w("la camisa", "the shirt"), w("los zapatos", "the shoes"), w("el sombrero", "the hat"), w("el vestido", "the dress"), w("los pantalones", "the pants"), w("la chaqueta", "the jacket")],
        sentences: [
          s("la camisa es azul", "the shirt is blue", ["la camisa", "es", "azul", "el vestido"], ["la camisa", "azul"]),
          s("yo quiero el sombrero", "I want the hat", ["yo quiero", "el sombrero", "la chaqueta", "los zapatos"], ["yo quiero", "el sombrero"]),
          s("el vestido es blanco", "the dress is white", ["el vestido", "es", "blanco", "los pantalones"], ["el vestido", "blanco"]),
        ],
      },
      {
        title: "Places",
        description: "School, the park, the beach",
        words: [w("la ciudad", "the city"), w("la escuela", "the school"), w("la tienda", "the store"), w("el parque", "the park"), w("la playa", "the beach"), w("el mercado", "the market")],
        sentences: [
          s("la escuela y el parque", "the school and the park", ["la escuela", "y", "el parque", "la tienda"], ["la escuela", "el parque"]),
          s("la tienda y el mercado", "the store and the market", ["la tienda", "y", "el mercado", "la playa"], ["la tienda", "el mercado"]),
          s("la ciudad y la playa", "the city and the beach", ["la ciudad", "y", "la playa", "la escuela"], ["la ciudad", "la playa"]),
        ],
      },
      {
        title: "Verbs I",
        description: "Speak, live, work, study",
        words: [w("yo hablo", "I speak"), w("yo vivo", "I live"), w("yo trabajo", "I work"), w("yo estudio", "I study"), w("yo leo", "I read"), w("yo escribo", "I write")],
        sentences: [
          s("yo hablo español", "I speak Spanish", ["yo hablo", "español", "yo leo", "yo vivo"], ["yo hablo"]),
          s("yo vivo en la ciudad", "I live in the city", ["yo vivo", "en", "la ciudad", "yo trabajo"], ["yo vivo", "la ciudad"]),
          s("yo estudio y yo trabajo", "I study and I work", ["yo estudio", "y", "yo trabajo", "yo escribo"], ["yo estudio", "yo trabajo"]),
        ],
      },
      {
        title: "Days",
        description: "Monday through the weekend",
        words: [w("lunes", "Monday"), w("martes", "Tuesday"), w("miércoles", "Wednesday"), w("jueves", "Thursday"), w("viernes", "Friday"), w("domingo", "Sunday")],
        sentences: [
          s("lunes y martes", "Monday and Tuesday", ["lunes", "y", "martes", "jueves"], ["lunes", "martes"]),
          s("yo trabajo el viernes", "I work on Friday", ["yo trabajo", "el", "viernes", "domingo"], ["yo trabajo", "viernes"]),
          s("yo estudio el domingo", "I study on Sunday", ["yo estudio", "el", "domingo", "miércoles"], ["yo estudio", "domingo"]),
        ],
      },
      {
        title: "Weather",
        description: "Sun, rain, hot and cold",
        words: [w("el sol", "the sun"), w("la lluvia", "the rain"), w("la nieve", "the snow"), w("el viento", "the wind"), w("hace frío", "it is cold"), w("hace calor", "it is hot")],
        sentences: [
          s("la lluvia y la nieve", "the rain and the snow", ["la lluvia", "y", "la nieve", "el sol"], ["la lluvia", "la nieve"]),
          s("el sol y el viento", "the sun and the wind", ["el sol", "y", "el viento", "la lluvia"], ["el sol", "el viento"]),
          s("hace frío hoy", "it is cold today", ["hace frío", "hoy", "hace calor", "el viento"], ["hace frío", "hoy"]),
        ],
      },
      {
        title: "The Body",
        description: "Head, hands, eyes",
        words: [w("la cabeza", "the head"), w("la mano", "the hand"), w("el pie", "the foot"), w("los ojos", "the eyes"), w("la boca", "the mouth"), w("el corazón", "the heart")],
        sentences: [
          s("la cabeza y la mano", "the head and the hand", ["la cabeza", "y", "la mano", "el pie"], ["la cabeza", "la mano"]),
          s("la boca y los ojos", "the mouth and the eyes", ["la boca", "y", "los ojos", "la cabeza"], ["la boca", "los ojos"]),
          s("el corazón es rojo", "the heart is red", ["el corazón", "es", "rojo", "la mano"], ["el corazón", "rojo"]),
        ],
      },
      {
        title: "Time",
        description: "Today, tomorrow, day and night",
        words: [w("hoy", "today"), w("mañana", "tomorrow"), w("ayer", "yesterday"), w("ahora", "now"), w("la noche", "the night"), w("el día", "the day")],
        sentences: [
          s("hoy y mañana", "today and tomorrow", ["hoy", "y", "mañana", "ayer"], ["hoy", "mañana"]),
          s("la noche y el día", "the night and the day", ["la noche", "y", "el día", "ahora"], ["la noche", "el día"]),
          s("yo trabajo ahora", "I work now", ["yo trabajo", "ahora", "ayer", "yo estudio"], ["yo trabajo", "ahora"]),
        ],
      },
      {
        title: "Verbs II",
        description: "Go, have, can, see",
        words: [w("yo voy", "I go"), w("yo tengo", "I have"), w("yo puedo", "I can"), w("yo veo", "I see"), w("yo hago", "I make"), w("yo doy", "I give")],
        sentences: [
          s("yo voy a la escuela", "I go to the school", ["yo voy", "a", "la escuela", "yo tengo"], ["yo voy", "la escuela"]),
          s("yo tengo un perro", "I have a dog", ["yo tengo", "un", "perro", "yo veo"], ["yo tengo", "el perro"]),
          s("yo veo el sol", "I see the sun", ["yo veo", "el sol", "yo hago", "yo doy"], ["yo veo", "el sol"]),
        ],
      },
      {
        title: "Travel",
        description: "Trains, planes, and tickets",
        words: [w("el tren", "the train"), w("el avión", "the airplane"), w("el coche", "the car"), w("el autobús", "the bus"), w("el boleto", "the ticket"), w("el viaje", "the trip")],
        sentences: [
          s("el tren y el autobús", "the train and the bus", ["el tren", "y", "el autobús", "el coche"], ["el tren", "el autobús"]),
          s("yo necesito un boleto", "I need a ticket", ["yo necesito", "un", "boleto", "el viaje"], ["yo necesito", "el boleto"]),
          s("yo voy en el coche", "I go in the car", ["yo voy", "en", "el coche", "el avión"], ["yo voy", "el coche"]),
        ],
      },
      {
        title: "Feelings",
        description: "Happy, sad, tired — how are you?",
        words: [w("yo estoy", "I am (feeling)"), w("feliz", "happy"), w("triste", "sad"), w("cansado", "tired"), w("bien", "well"), w("mal", "bad")],
        sentences: [
          s("yo estoy feliz", "I am happy", ["yo estoy", "feliz", "triste", "bien"], ["yo estoy", "feliz"]),
          s("yo estoy cansado", "I am tired", ["yo estoy", "cansado", "mal", "feliz"], ["yo estoy", "cansado"]),
          s("yo estoy bien", "I am well", ["yo estoy", "bien", "mal", "triste"], ["yo estoy", "bien"]),
        ],
      },
      {
        title: "At the Restaurant",
        description: "Order dinner and ask for the bill",
        words: [w("el menú", "the menu"), w("la cuenta", "the bill"), w("el plato", "the plate"), w("la cena", "the dinner"), w("delicioso", "delicious"), w("el camarero", "the waiter")],
        sentences: [
          s("yo quiero el menú", "I want the menu", ["yo quiero", "el menú", "la cuenta", "el plato"], ["yo quiero", "el menú"]),
          s("el plato es delicioso", "the plate is delicious", ["el plato", "es", "delicioso", "la cena"], ["el plato", "delicioso"]),
          s("yo necesito la cuenta", "I need the bill", ["yo necesito", "la cuenta", "el camarero", "el menú"], ["yo necesito", "la cuenta"]),
        ],
      },
    ],
  },
  // ==================== SECTION 3 ====================
  {
    id: "section-3",
    title: "Section 3: Everyday Life",
    description: "Routines, work, school, and what fills the day",
    units: [
      {
        title: "Routines",
        description: "Wake up, get up, rest",
        words: [w("me despierto", "I wake up"), w("me levanto", "I get up"), w("yo duermo", "I sleep"), w("yo descanso", "I rest"), w("temprano", "early"), w("tarde", "late")],
        sentences: [
          s("me despierto temprano", "I wake up early", ["me despierto", "temprano", "tarde", "yo duermo"], ["me despierto", "temprano"]),
          s("yo duermo mucho", "I sleep a lot", ["yo duermo", "mucho", "yo descanso", "temprano"], ["yo duermo", "mucho"]),
          s("me levanto tarde hoy", "I get up late today", ["me levanto", "tarde", "hoy", "temprano"], ["me levanto", "tarde", "hoy"]),
        ],
      },
      {
        title: "Work",
        description: "The office, the boss, the busy day",
        words: [w("el trabajo", "the job"), w("la oficina", "the office"), w("el jefe", "the boss"), w("la reunión", "the meeting"), w("ocupado", "busy"), w("el proyecto", "the project")],
        sentences: [
          s("el jefe y la oficina", "the boss and the office", ["el jefe", "y", "la oficina", "el trabajo"], ["el jefe", "la oficina"]),
          s("yo trabajo en la oficina", "I work in the office", ["yo trabajo", "en", "la oficina", "la reunión"], ["yo trabajo", "la oficina"]),
          s("yo estoy ocupado hoy", "I am busy today", ["yo estoy", "ocupado", "hoy", "el proyecto"], ["yo estoy", "ocupado", "hoy"]),
        ],
      },
      {
        title: "School",
        description: "Classes, books, and homework",
        words: [w("la clase", "the class"), w("el maestro", "the teacher"), w("el libro", "the book"), w("la tarea", "the homework"), w("el examen", "the exam"), w("el lápiz", "the pencil")],
        sentences: [
          s("el maestro y la clase", "the teacher and the class", ["el maestro", "y", "la clase", "el libro"], ["el maestro", "la clase"]),
          s("yo leo el libro", "I read the book", ["yo leo", "el libro", "la tarea", "el lápiz"], ["yo leo", "el libro"]),
          s("yo estudio para el examen", "I study for the exam", ["yo estudio", "para", "el examen", "la clase"], ["yo estudio", "el examen"]),
        ],
      },
      {
        title: "Shopping",
        description: "Buy it, pay for it, find a bargain",
        words: [w("la ropa", "the clothes"), w("el precio", "the price"), w("caro", "expensive"), w("barato", "cheap"), w("yo compro", "I buy"), w("yo pago", "I pay")],
        sentences: [
          s("yo compro la ropa", "I buy the clothes", ["yo compro", "la ropa", "el precio", "yo pago"], ["yo compro", "la ropa"]),
          s("el sombrero es barato", "the hat is cheap", ["el sombrero", "es", "barato", "caro"], ["el sombrero", "barato"]),
          s("yo pago mucho", "I pay a lot", ["yo pago", "mucho", "yo compro", "barato"], ["yo pago", "mucho"]),
        ],
      },
      {
        title: "Money",
        description: "Banks, cards, and cash",
        words: [w("el dinero", "the money"), w("el banco", "the bank"), w("la tarjeta", "the card"), w("el efectivo", "the cash"), w("yo ahorro", "I save"), w("yo gasto", "I spend")],
        sentences: [
          s("el dinero y el banco", "the money and the bank", ["el dinero", "y", "el banco", "la tarjeta"], ["el dinero", "el banco"]),
          s("yo pago con la tarjeta", "I pay with the card", ["yo pago", "con", "la tarjeta", "el efectivo"], ["yo pago", "la tarjeta"]),
          s("yo ahorro el dinero", "I save the money", ["yo ahorro", "el dinero", "yo gasto", "el banco"], ["yo ahorro", "el dinero"]),
        ],
      },
      {
        title: "The Kitchen",
        description: "Cook the soup, set the table",
        words: [w("yo cocino", "I cook"), w("la sopa", "the soup"), w("el cuchillo", "the knife"), w("la taza", "the cup"), w("el vaso", "the glass"), w("el horno", "the oven")],
        sentences: [
          s("yo cocino la sopa", "I cook the soup", ["yo cocino", "la sopa", "el horno", "la taza"], ["yo cocino", "la sopa"]),
          s("el cuchillo y el vaso", "the knife and the glass", ["el cuchillo", "y", "el vaso", "la taza"], ["el cuchillo", "el vaso"]),
          s("la taza y el horno", "the cup and the oven", ["la taza", "y", "el horno", "la sopa"], ["la taza", "el horno"]),
        ],
      },
      {
        title: "Hobbies",
        description: "Sing, dance, paint, play",
        words: [w("yo canto", "I sing"), w("yo bailo", "I dance"), w("yo pinto", "I paint"), w("yo juego", "I play"), w("la música", "the music"), w("el arte", "the art")],
        sentences: [
          s("yo canto y yo bailo", "I sing and I dance", ["yo canto", "y", "yo bailo", "yo pinto"], ["yo canto", "yo bailo"]),
          s("yo juego mucho", "I play a lot", ["yo juego", "mucho", "yo canto", "el arte"], ["yo juego", "mucho"]),
          s("la música y el arte", "the music and the art", ["la música", "y", "el arte", "yo bailo"], ["la música", "el arte"]),
        ],
      },
      {
        title: "Sports",
        description: "Run, swim, win the game",
        words: [w("el fútbol", "soccer"), w("el equipo", "the team"), w("el partido", "the game"), w("yo corro", "I run"), w("yo nado", "I swim"), w("yo gano", "I win")],
        sentences: [
          s("yo juego el fútbol", "I play soccer", ["yo juego", "el fútbol", "el equipo", "yo corro"], ["yo juego", "el fútbol"]),
          s("yo corro y yo nado", "I run and I swim", ["yo corro", "y", "yo nado", "yo gano"], ["yo corro", "yo nado"]),
          s("yo gano el partido", "I win the game", ["yo gano", "el partido", "el equipo", "el fútbol"], ["yo gano", "el partido"]),
        ],
      },
    ],
  },
  // ==================== SECTION 4 ====================
  {
    id: "section-4",
    title: "Section 4: Getting Around",
    description: "Directions, trips, hotels, and life out in the city",
    units: [
      {
        title: "Directions",
        description: "Left, right, near and far",
        words: [w("la calle", "the street"), w("a la derecha", "to the right"), w("a la izquierda", "to the left"), w("derecho", "straight ahead"), w("cerca", "near"), w("lejos", "far")],
        sentences: [
          s("la calle a la derecha", "the street to the right", ["la calle", "a la derecha", "a la izquierda", "derecho"], ["la calle", "a la derecha"]),
          s("cerca y lejos", "near and far", ["cerca", "y", "lejos", "derecho"], ["cerca", "lejos"]),
          s("yo voy a la izquierda", "I go to the left", ["yo voy", "a la izquierda", "a la derecha", "la calle"], ["yo voy", "a la izquierda"]),
        ],
      },
      {
        title: "Around Town",
        description: "Museums, bridges, and the square",
        words: [w("el edificio", "the building"), w("el museo", "the museum"), w("la iglesia", "the church"), w("el puente", "the bridge"), w("la plaza", "the square"), w("el centro", "downtown")],
        sentences: [
          s("el museo y la iglesia", "the museum and the church", ["el museo", "y", "la iglesia", "el puente"], ["el museo", "la iglesia"]),
          s("yo voy a la plaza", "I go to the square", ["yo voy", "a", "la plaza", "el centro"], ["yo voy", "la plaza"]),
          s("el puente y el edificio", "the bridge and the building", ["el puente", "y", "el edificio", "el museo"], ["el puente", "el edificio"]),
        ],
      },
      {
        title: "Hotels",
        description: "Rooms, keys, and reservations",
        words: [w("el hotel", "the hotel"), w("la habitación", "the room"), w("la llave", "the key"), w("la maleta", "the suitcase"), w("la reserva", "the reservation"), w("la piscina", "the pool")],
        sentences: [
          s("el hotel y la piscina", "the hotel and the pool", ["el hotel", "y", "la piscina", "la habitación"], ["el hotel", "la piscina"]),
          s("yo necesito la llave", "I need the key", ["yo necesito", "la llave", "la reserva", "la maleta"], ["yo necesito", "la llave"]),
          s("la maleta en la habitación", "the suitcase in the room", ["la maleta", "en", "la habitación", "el hotel"], ["la maleta", "la habitación"]),
        ],
      },
      {
        title: "At the Airport",
        description: "Flights, passports, departures",
        words: [w("el aeropuerto", "the airport"), w("el vuelo", "the flight"), w("el pasaporte", "the passport"), w("el equipaje", "the luggage"), w("la salida", "the departure"), w("la llegada", "the arrival")],
        sentences: [
          s("el vuelo y el aeropuerto", "the flight and the airport", ["el vuelo", "y", "el aeropuerto", "el equipaje"], ["el vuelo", "el aeropuerto"]),
          s("yo tengo el pasaporte", "I have the passport", ["yo tengo", "el pasaporte", "el vuelo", "la salida"], ["yo tengo", "el pasaporte"]),
          s("la salida y la llegada", "the departure and the arrival", ["la salida", "y", "la llegada", "el equipaje"], ["la salida", "la llegada"]),
        ],
      },
      {
        title: "Ordering Food",
        description: "Breakfast, dessert, and the tip",
        words: [w("el desayuno", "the breakfast"), w("el almuerzo", "the lunch"), w("la propina", "the tip"), w("el postre", "the dessert"), w("yo pido", "I order"), w("la mesera", "the waitress")],
        sentences: [
          s("yo pido el desayuno", "I order the breakfast", ["yo pido", "el desayuno", "el almuerzo", "el postre"], ["yo pido", "el desayuno"]),
          s("el almuerzo y el postre", "the lunch and the dessert", ["el almuerzo", "y", "el postre", "el desayuno"], ["el almuerzo", "el postre"]),
          s("la propina para la mesera", "the tip for the waitress", ["la propina", "para", "la mesera", "el postre"], ["la propina", "la mesera"]),
        ],
      },
      {
        title: "Health",
        description: "Doctors, medicine, feeling sick",
        words: [w("el médico", "the doctor"), w("el hospital", "the hospital"), w("la medicina", "the medicine"), w("enfermo", "sick"), w("el dolor", "the pain"), w("la cita", "the appointment")],
        sentences: [
          s("yo estoy enfermo", "I am sick", ["yo estoy", "enfermo", "el dolor", "bien"], ["yo estoy", "enfermo"]),
          s("el médico y el hospital", "the doctor and the hospital", ["el médico", "y", "el hospital", "la cita"], ["el médico", "el hospital"]),
          s("yo necesito la medicina", "I need the medicine", ["yo necesito", "la medicina", "el dolor", "la cita"], ["yo necesito", "la medicina"]),
        ],
      },
      {
        title: "Nature",
        description: "Trees, rivers, mountains, sea",
        words: [w("el árbol", "the tree"), w("la flor", "the flower"), w("el río", "the river"), w("la montaña", "the mountain"), w("el mar", "the sea"), w("el cielo", "the sky")],
        sentences: [
          s("el árbol y la flor", "the tree and the flower", ["el árbol", "y", "la flor", "el río"], ["el árbol", "la flor"]),
          s("el río y el mar", "the river and the sea", ["el río", "y", "el mar", "la montaña"], ["el río", "el mar"]),
          s("la montaña y el cielo", "the mountain and the sky", ["la montaña", "y", "el cielo", "la flor"], ["la montaña", "el cielo"]),
        ],
      },
      {
        title: "Seasons",
        description: "Spring, summer, and the year",
        words: [w("la primavera", "the spring"), w("el verano", "the summer"), w("el otoño", "the autumn"), w("el invierno", "the winter"), w("la estación", "the season"), w("el año", "the year")],
        sentences: [
          s("el verano y el invierno", "the summer and the winter", ["el verano", "y", "el invierno", "el otoño"], ["el verano", "el invierno"]),
          s("la primavera y el otoño", "the spring and the autumn", ["la primavera", "y", "el otoño", "el año"], ["la primavera", "el otoño"]),
          s("hace calor en el verano", "it is hot in the summer", ["hace calor", "en", "el verano", "el invierno"], ["hace calor", "el verano"]),
        ],
      },
    ],
  },
  // ==================== SECTION 5 ====================
  {
    id: "section-5",
    title: "Section 5: Past & Future",
    description: "Talk about yesterday and plan tomorrow",
    units: [
      {
        title: "Yesterday",
        description: "Went, ate, saw — the past tense",
        words: [w("yo fui", "I went"), w("yo comí", "I ate"), w("yo bebí", "I drank"), w("yo vi", "I saw"), w("yo hice", "I made"), w("yo tuve", "I had")],
        sentences: [
          s("ayer yo fui a la escuela", "yesterday I went to the school", ["ayer", "yo fui", "a", "la escuela", "yo vi"], ["ayer", "yo fui", "la escuela"]),
          s("yo comí mucho ayer", "I ate a lot yesterday", ["yo comí", "mucho", "ayer", "yo bebí"], ["yo comí", "ayer"]),
          s("yo vi el mar", "I saw the sea", ["yo vi", "el mar", "yo hice", "yo tuve"], ["yo vi", "el mar"]),
        ],
      },
      {
        title: "Last Week",
        description: "Weeks, months, and what you did",
        words: [w("la semana", "the week"), w("el mes", "the month"), w("pasado", "last (past)"), w("yo hablé", "I spoke"), w("yo trabajé", "I worked"), w("yo estudié", "I studied")],
        sentences: [
          s("la semana y el mes", "the week and the month", ["la semana", "y", "el mes", "pasado"], ["la semana", "el mes"]),
          s("yo trabajé mucho", "I worked a lot", ["yo trabajé", "mucho", "yo hablé", "la semana"], ["yo trabajé", "mucho"]),
          s("yo estudié ayer", "I studied yesterday", ["yo estudié", "ayer", "yo trabajé", "el mes"], ["yo estudié", "ayer"]),
        ],
      },
      {
        title: "Childhood",
        description: "Used to play, used to live",
        words: [w("la infancia", "the childhood"), w("joven", "young"), w("viejo", "old"), w("yo era", "I used to be"), w("yo jugaba", "I used to play"), w("yo vivía", "I used to live")],
        sentences: [
          s("yo era joven", "I used to be young", ["yo era", "joven", "viejo", "la infancia"], ["yo era", "joven"]),
          s("yo jugaba mucho", "I used to play a lot", ["yo jugaba", "mucho", "yo vivía", "joven"], ["yo jugaba", "mucho"]),
          s("yo vivía en la ciudad", "I used to live in the city", ["yo vivía", "en", "la ciudad", "yo era"], ["yo vivía", "la ciudad"]),
        ],
      },
      {
        title: "Future Plans",
        description: "Going to, soon, later",
        words: [w("voy a", "I am going to"), w("el plan", "the plan"), w("el futuro", "the future"), w("pronto", "soon"), w("después", "later"), w("la meta", "the goal")],
        sentences: [
          s("voy a trabajar mañana", "I am going to work tomorrow", ["voy a", "trabajar", "mañana", "pronto"], ["voy a", "mañana"]),
          s("el plan y la meta", "the plan and the goal", ["el plan", "y", "la meta", "el futuro"], ["el plan", "la meta"]),
          s("yo voy después", "I go later", ["yo voy", "después", "pronto", "ahora"], ["yo voy", "después"]),
        ],
      },
      {
        title: "Dreams & Goals",
        description: "Hopes, success, who you want to be",
        words: [w("el sueño", "the dream"), w("la esperanza", "the hope"), w("yo quiero ser", "I want to be"), w("famoso", "famous"), w("rico", "rich"), w("el éxito", "the success")],
        sentences: [
          s("yo quiero ser famoso", "I want to be famous", ["yo quiero ser", "famoso", "rico", "el éxito"], ["yo quiero ser", "famoso"]),
          s("el sueño y la esperanza", "the dream and the hope", ["el sueño", "y", "la esperanza", "la meta"], ["el sueño", "la esperanza"]),
          s("yo quiero ser rico", "I want to be rich", ["yo quiero ser", "rico", "famoso", "el sueño"], ["yo quiero ser", "rico"]),
        ],
      },
      {
        title: "Stories",
        description: "Once upon a time…",
        words: [w("el cuento", "the story"), w("el principio", "the beginning"), w("el final", "the end"), w("el héroe", "the hero"), w("la magia", "the magic"), w("érase una vez", "once upon a time")],
        sentences: [
          s("érase una vez un héroe", "once upon a time a hero", ["érase una vez", "un", "héroe", "la magia"], ["érase una vez", "el héroe"]),
          s("el principio y el final", "the beginning and the end", ["el principio", "y", "el final", "el cuento"], ["el principio", "el final"]),
          s("el cuento y la magia", "the story and the magic", ["el cuento", "y", "la magia", "el héroe"], ["el cuento", "la magia"]),
        ],
      },
      {
        title: "The News",
        description: "Newspapers, the world, what matters",
        words: [w("las noticias", "the news"), w("el periódico", "the newspaper"), w("el mundo", "the world"), w("importante", "important"), w("verdad", "true"), w("la historia", "the history")],
        sentences: [
          s("las noticias y el periódico", "the news and the newspaper", ["las noticias", "y", "el periódico", "el mundo"], ["las noticias", "el periódico"]),
          s("la historia es importante", "the history is important", ["la historia", "es", "importante", "verdad"], ["la historia", "importante"]),
          s("las noticias son verdad", "the news is true", ["las noticias", "son", "verdad", "el periódico"], ["las noticias", "verdad"]),
        ],
      },
      {
        title: "Opinions",
        description: "I think, I believe, maybe",
        words: [w("yo pienso", "I think"), w("yo creo", "I believe"), w("la opinión", "the opinion"), w("la razón", "the reason"), w("de acuerdo", "agreed"), w("quizás", "maybe")],
        sentences: [
          s("yo pienso mucho", "I think a lot", ["yo pienso", "mucho", "yo creo", "quizás"], ["yo pienso", "mucho"]),
          s("yo creo las noticias", "I believe the news", ["yo creo", "las noticias", "la opinión", "la razón"], ["yo creo", "las noticias"]),
          s("quizás yo voy mañana", "maybe I go tomorrow", ["quizás", "yo voy", "mañana", "de acuerdo"], ["quizás", "yo voy", "mañana"]),
        ],
      },
    ],
  },
  // ==================== SECTION 6 ====================
  {
    id: "section-6",
    title: "Section 6: Conversations",
    description: "Small talk, plans, and getting along",
    units: [
      {
        title: "Small Talk",
        description: "How are you? Nice to meet you!",
        words: [w("¿cómo estás?", "how are you?"), w("muy bien", "very well"), w("¿qué tal?", "what's up?"), w("mucho gusto", "nice to meet you"), w("hasta luego", "see you later"), w("el gusto", "the pleasure")],
        sentences: [
          s("hola ¿cómo estás?", "hello how are you?", ["hola", "¿cómo estás?", "¿qué tal?", "muy bien"], ["hola", "¿cómo estás?"]),
          s("muy bien gracias", "very well thank you", ["muy bien", "gracias", "mucho gusto", "hasta luego"], ["muy bien", "gracias"]),
          s("mucho gusto y hasta luego", "nice to meet you and see you later", ["mucho gusto", "y", "hasta luego", "¿qué tal?"], ["mucho gusto", "hasta luego"]),
        ],
      },
      {
        title: "Making Plans",
        description: "Parties, weekends, being free",
        words: [w("la fiesta", "the party"), w("el fin de semana", "the weekend"), w("libre", "free"), w("la invitación", "the invitation"), w("yo invito", "I invite"), w("juntos", "together")],
        sentences: [
          s("la fiesta el fin de semana", "the party on the weekend", ["la fiesta", "el fin de semana", "libre", "juntos"], ["la fiesta", "el fin de semana"]),
          s("yo invito a mi amigo", "I invite my friend", ["yo invito", "a", "mi", "amigo", "la fiesta"], ["yo invito", "el amigo"]),
          s("yo estoy libre hoy", "I am free today", ["yo estoy", "libre", "hoy", "juntos"], ["yo estoy", "libre", "hoy"]),
        ],
      },
      {
        title: "The Phone",
        description: "Calls, messages, numbers",
        words: [w("el teléfono", "the phone"), w("el mensaje", "the message"), w("la llamada", "the call"), w("yo llamo", "I call"), w("yo envío", "I send"), w("el número", "the number")],
        sentences: [
          s("yo llamo mañana", "I call tomorrow", ["yo llamo", "mañana", "hoy", "el teléfono"], ["yo llamo", "mañana"]),
          s("yo envío el mensaje", "I send the message", ["yo envío", "el mensaje", "la llamada", "el número"], ["yo envío", "el mensaje"]),
          s("el teléfono y el número", "the phone and the number", ["el teléfono", "y", "el número", "el mensaje"], ["el teléfono", "el número"]),
        ],
      },
      {
        title: "Descriptions",
        description: "Tall, small, pretty, strong",
        words: [w("alto", "tall"), w("bajo", "short (height)"), w("grande", "big"), w("pequeño", "small"), w("bonito", "pretty"), w("fuerte", "strong")],
        sentences: [
          s("el hombre es alto", "the man is tall", ["el hombre", "es", "alto", "bajo"], ["el hombre", "alto"]),
          s("la casa es grande", "the house is big", ["la casa", "es", "grande", "pequeño"], ["la casa", "grande"]),
          s("el perro es pequeño y fuerte", "the dog is small and strong", ["el perro", "es", "pequeño", "y", "fuerte", "bonito"], ["el perro", "pequeño", "fuerte"]),
        ],
      },
      {
        title: "Personality",
        description: "Kind, funny, brave",
        words: [w("amable", "kind"), w("divertido", "funny"), w("serio", "serious"), w("inteligente", "intelligent"), w("tímido", "shy"), w("valiente", "brave")],
        sentences: [
          s("mi amigo es amable", "my friend is kind", ["mi", "amigo", "es", "amable", "serio"], ["el amigo", "amable"]),
          s("el maestro es serio", "the teacher is serious", ["el maestro", "es", "serio", "divertido"], ["el maestro", "serio"]),
          s("la niña es valiente", "the girl is brave", ["la niña", "es", "valiente", "tímido"], ["la niña", "valiente"]),
        ],
      },
      {
        title: "Relationships",
        description: "Love, spouses, sweethearts",
        words: [w("el novio", "the boyfriend"), w("la novia", "the girlfriend"), w("el esposo", "the husband"), w("la esposa", "the wife"), w("el amor", "the love"), w("yo amo", "I love")],
        sentences: [
          s("yo amo a mi esposa", "I love my wife", ["yo amo", "a", "mi", "esposa", "el amor"], ["yo amo", "la esposa"]),
          s("el novio y la novia", "the boyfriend and the girlfriend", ["el novio", "y", "la novia", "el esposo"], ["el novio", "la novia"]),
          s("el amor es grande", "the love is big", ["el amor", "es", "grande", "pequeño"], ["el amor", "grande"]),
        ],
      },
      {
        title: "Help & Advice",
        description: "Problems, questions, answers",
        words: [w("la ayuda", "the help"), w("el consejo", "the advice"), w("el problema", "the problem"), w("la pregunta", "the question"), w("la respuesta", "the answer"), w("yo ayudo", "I help")],
        sentences: [
          s("yo necesito la ayuda", "I need the help", ["yo necesito", "la ayuda", "el consejo", "el problema"], ["yo necesito", "la ayuda"]),
          s("la pregunta y la respuesta", "the question and the answer", ["la pregunta", "y", "la respuesta", "la ayuda"], ["la pregunta", "la respuesta"]),
          s("yo ayudo a mi hermano", "I help my brother", ["yo ayudo", "a", "mi", "hermano", "la ayuda"], ["yo ayudo", "el hermano"]),
        ],
      },
      {
        title: "Politeness",
        description: "Sorry, excuse me, of course",
        words: [w("perdón", "pardon"), w("lo siento", "I'm sorry"), w("con permiso", "excuse me"), w("de nada", "you're welcome"), w("claro", "of course"), w("bienvenido", "welcome")],
        sentences: [
          s("perdón y gracias", "pardon and thank you", ["perdón", "y", "gracias", "claro"], ["perdón", "gracias"]),
          s("lo siento mucho", "I'm very sorry", ["lo siento", "mucho", "perdón", "de nada"], ["lo siento", "mucho"]),
          s("de nada y bienvenido", "you're welcome and welcome", ["de nada", "y", "bienvenido", "con permiso"], ["de nada", "bienvenido"]),
        ],
      },
    ],
  },
  // ==================== SECTION 7 ====================
  {
    id: "section-7",
    title: "Section 7: The Wider World",
    description: "Countries, culture, art, and the planet",
    units: [
      {
        title: "Countries",
        description: "Spain, Mexico, and beyond",
        words: [w("España", "Spain"), w("México", "Mexico"), w("los Estados Unidos", "the United States"), w("el país", "the country"), w("la frontera", "the border"), w("extranjero", "foreign")],
        sentences: [
          s("España y México", "Spain and Mexico", ["España", "y", "México", "el país"], ["España", "México"]),
          s("yo vivo en los Estados Unidos", "I live in the United States", ["yo vivo", "en", "los Estados Unidos", "España"], ["yo vivo", "los Estados Unidos"]),
          s("el país y la frontera", "the country and the border", ["el país", "y", "la frontera", "extranjero"], ["el país", "la frontera"]),
        ],
      },
      {
        title: "Languages",
        description: "Words, sentences, understanding",
        words: [w("el español", "Spanish (language)"), w("el inglés", "English (language)"), w("la palabra", "the word"), w("la frase", "the sentence"), w("yo aprendo", "I learn"), w("yo entiendo", "I understand")],
        sentences: [
          s("yo aprendo el español", "I learn Spanish", ["yo aprendo", "el español", "el inglés", "la palabra"], ["yo aprendo", "el español"]),
          s("yo entiendo la palabra", "I understand the word", ["yo entiendo", "la palabra", "la frase", "el inglés"], ["yo entiendo", "la palabra"]),
          s("el inglés y el español", "English and Spanish", ["el inglés", "y", "el español", "la frase"], ["el inglés", "el español"]),
        ],
      },
      {
        title: "Culture",
        description: "Traditions, festivals, customs",
        words: [w("la cultura", "the culture"), w("la tradición", "the tradition"), w("el baile", "the dance"), w("el festival", "the festival"), w("típico", "typical"), w("la costumbre", "the custom")],
        sentences: [
          s("la cultura y la tradición", "the culture and the tradition", ["la cultura", "y", "la tradición", "el baile"], ["la cultura", "la tradición"]),
          s("el baile y el festival", "the dance and the festival", ["el baile", "y", "el festival", "la costumbre"], ["el baile", "el festival"]),
          s("el baile es típico", "the dance is typical", ["el baile", "es", "típico", "la cultura"], ["el baile", "típico"]),
        ],
      },
      {
        title: "Music & Art",
        description: "Songs, guitars, paintings",
        words: [w("la canción", "the song"), w("el cantante", "the singer"), w("la guitarra", "the guitar"), w("el cuadro", "the painting"), w("el artista", "the artist"), w("yo escucho", "I listen")],
        sentences: [
          s("yo escucho la canción", "I listen to the song", ["yo escucho", "la canción", "la guitarra", "el cantante"], ["yo escucho", "la canción"]),
          s("el cantante y la guitarra", "the singer and the guitar", ["el cantante", "y", "la guitarra", "el artista"], ["el cantante", "la guitarra"]),
          s("el artista y el cuadro", "the artist and the painting", ["el artista", "y", "el cuadro", "la canción"], ["el artista", "el cuadro"]),
        ],
      },
      {
        title: "Movies & TV",
        description: "Actors, screens, what to watch",
        words: [w("la película", "the movie"), w("la televisión", "the television"), w("el actor", "the actor"), w("la actriz", "the actress"), w("la pantalla", "the screen"), w("yo miro", "I watch")],
        sentences: [
          s("yo miro la película", "I watch the movie", ["yo miro", "la película", "la televisión", "el actor"], ["yo miro", "la película"]),
          s("el actor y la actriz", "the actor and the actress", ["el actor", "y", "la actriz", "la pantalla"], ["el actor", "la actriz"]),
          s("la televisión y la pantalla", "the television and the screen", ["la televisión", "y", "la pantalla", "la película"], ["la televisión", "la pantalla"]),
        ],
      },
      {
        title: "Books & Ideas",
        description: "Novels, poems, big ideas",
        words: [w("la novela", "the novel"), w("el poema", "the poem"), w("el autor", "the author"), w("la idea", "the idea"), w("la página", "the page"), w("interesante", "interesting")],
        sentences: [
          s("la novela es interesante", "the novel is interesting", ["la novela", "es", "interesante", "el poema"], ["la novela", "interesante"]),
          s("el autor y el poema", "the author and the poem", ["el autor", "y", "el poema", "la novela"], ["el autor", "el poema"]),
          s("la idea y la página", "the idea and the page", ["la idea", "y", "la página", "el autor"], ["la idea", "la página"]),
        ],
      },
      {
        title: "History",
        description: "Kings, queens, war and peace",
        words: [w("la guerra", "the war"), w("la paz", "the peace"), w("el rey", "the king"), w("la reina", "the queen"), w("antiguo", "ancient"), w("el siglo", "the century")],
        sentences: [
          s("la guerra y la paz", "the war and the peace", ["la guerra", "y", "la paz", "el rey"], ["la guerra", "la paz"]),
          s("el rey y la reina", "the king and the queen", ["el rey", "y", "la reina", "el siglo"], ["el rey", "la reina"]),
          s("el país es antiguo", "the country is ancient", ["el país", "es", "antiguo", "el siglo"], ["el país", "antiguo"]),
        ],
      },
      {
        title: "The Planet",
        description: "Earth, climate, keeping it clean",
        words: [w("la tierra", "the earth"), w("el planeta", "the planet"), w("el clima", "the climate"), w("la energía", "the energy"), w("limpio", "clean"), w("yo reciclo", "I recycle")],
        sentences: [
          s("la tierra y el planeta", "the earth and the planet", ["la tierra", "y", "el planeta", "el clima"], ["la tierra", "el planeta"]),
          s("yo reciclo mucho", "I recycle a lot", ["yo reciclo", "mucho", "limpio", "la energía"], ["yo reciclo", "mucho"]),
          s("el planeta es limpio", "the planet is clean", ["el planeta", "es", "limpio", "el clima"], ["el planeta", "limpio"]),
        ],
      },
    ],
  },
  // ==================== SECTION 8 ====================
  {
    id: "section-8",
    title: "Section 8: Mastery",
    description: "Deep feelings, big ideas, and speaking your mind",
    units: [
      {
        title: "Emotions in Depth",
        description: "Proud, grateful, surprised",
        words: [w("orgulloso", "proud"), w("celoso", "jealous"), w("agradecido", "grateful"), w("la sorpresa", "the surprise"), w("el miedo", "the fear"), w("la alegría", "the joy")],
        sentences: [
          s("yo estoy orgulloso", "I am proud", ["yo estoy", "orgulloso", "celoso", "el miedo"], ["yo estoy", "orgulloso"]),
          s("el miedo y la alegría", "the fear and the joy", ["el miedo", "y", "la alegría", "la sorpresa"], ["el miedo", "la alegría"]),
          s("yo estoy agradecido hoy", "I am grateful today", ["yo estoy", "agradecido", "hoy", "orgulloso"], ["yo estoy", "agradecido", "hoy"]),
        ],
      },
      {
        title: "Careers",
        description: "Interviews, salaries, clients",
        words: [w("la carrera", "the career"), w("la entrevista", "the interview"), w("el sueldo", "the salary"), w("la empresa", "the company"), w("el cliente", "the client"), w("exitoso", "successful")],
        sentences: [
          s("la entrevista y la empresa", "the interview and the company", ["la entrevista", "y", "la empresa", "el sueldo"], ["la entrevista", "la empresa"]),
          s("el sueldo es importante", "the salary is important", ["el sueldo", "es", "importante", "exitoso"], ["el sueldo", "importante"]),
          s("el cliente y la carrera", "the client and the career", ["el cliente", "y", "la carrera", "la empresa"], ["el cliente", "la carrera"]),
        ],
      },
      {
        title: "Science",
        description: "Experiments, theories, discoveries",
        words: [w("la ciencia", "the science"), w("el experimento", "the experiment"), w("la teoría", "the theory"), w("el descubrimiento", "the discovery"), w("la célula", "the cell"), w("el laboratorio", "the laboratory")],
        sentences: [
          s("la ciencia y la teoría", "the science and the theory", ["la ciencia", "y", "la teoría", "la célula"], ["la ciencia", "la teoría"]),
          s("el experimento en el laboratorio", "the experiment in the laboratory", ["el experimento", "en", "el laboratorio", "la teoría"], ["el experimento", "el laboratorio"]),
          s("el descubrimiento es importante", "the discovery is important", ["el descubrimiento", "es", "importante", "la ciencia"], ["el descubrimiento", "importante"]),
        ],
      },
      {
        title: "Society",
        description: "Laws, rights, freedom",
        words: [w("la sociedad", "the society"), w("la ley", "the law"), w("el derecho", "the right"), w("la libertad", "the freedom"), w("la justicia", "the justice"), w("el gobierno", "the government")],
        sentences: [
          s("la ley y la justicia", "the law and the justice", ["la ley", "y", "la justicia", "el derecho"], ["la ley", "la justicia"]),
          s("la libertad es importante", "the freedom is important", ["la libertad", "es", "importante", "la ley"], ["la libertad", "importante"]),
          s("la sociedad y el gobierno", "the society and the government", ["la sociedad", "y", "el gobierno", "la libertad"], ["la sociedad", "el gobierno"]),
        ],
      },
      {
        title: "Debate",
        description: "Arguments, evidence, taking sides",
        words: [w("el debate", "the debate"), w("el argumento", "the argument"), w("a favor", "in favor"), w("en contra", "against"), w("el punto", "the point"), w("la evidencia", "the evidence")],
        sentences: [
          s("a favor y en contra", "in favor and against", ["a favor", "y", "en contra", "el punto"], ["a favor", "en contra"]),
          s("el argumento y la evidencia", "the argument and the evidence", ["el argumento", "y", "la evidencia", "el debate"], ["el argumento", "la evidencia"]),
          s("el debate y el punto", "the debate and the point", ["el debate", "y", "el punto", "la evidencia"], ["el debate", "el punto"]),
        ],
      },
      {
        title: "Abstract Ideas",
        description: "Mind, thought, wisdom",
        words: [w("la mente", "the mind"), w("el pensamiento", "the thought"), w("el conocimiento", "the knowledge"), w("la sabiduría", "the wisdom"), w("profundo", "deep"), w("la duda", "the doubt")],
        sentences: [
          s("la mente y el pensamiento", "the mind and the thought", ["la mente", "y", "el pensamiento", "la duda"], ["la mente", "el pensamiento"]),
          s("el conocimiento y la sabiduría", "the knowledge and the wisdom", ["el conocimiento", "y", "la sabiduría", "la mente"], ["el conocimiento", "la sabiduría"]),
          s("el pensamiento es profundo", "the thought is deep", ["el pensamiento", "es", "profundo", "la duda"], ["el pensamiento", "profundo"]),
        ],
      },
      {
        title: "Jokes & Luck",
        description: "Sayings, jokes, good luck",
        words: [w("el refrán", "the saying"), w("la suerte", "the luck"), w("buena suerte", "good luck"), w("el chiste", "the joke"), w("gracioso", "hilarious"), w("la broma", "the prank")],
        sentences: [
          s("buena suerte mañana", "good luck tomorrow", ["buena suerte", "mañana", "hoy", "la suerte"], ["buena suerte", "mañana"]),
          s("el chiste es gracioso", "the joke is hilarious", ["el chiste", "es", "gracioso", "la broma"], ["el chiste", "gracioso"]),
          s("el refrán y la broma", "the saying and the prank", ["el refrán", "y", "la broma", "el chiste"], ["el refrán", "la broma"]),
        ],
      },
      {
        title: "The Next Chapter",
        description: "Farewells, achievements, adventure",
        words: [w("la despedida", "the farewell"), w("el logro", "the achievement"), w("la aventura", "the adventure"), w("siguiente", "next"), w("el capítulo", "the chapter"), w("felicidades", "congratulations")],
        sentences: [
          s("felicidades por el logro", "congratulations on the achievement", ["felicidades", "por", "el logro", "la aventura"], ["felicidades", "el logro"]),
          s("la aventura y el capítulo", "the adventure and the chapter", ["la aventura", "y", "el capítulo", "la despedida"], ["la aventura", "el capítulo"]),
          s("el siguiente capítulo", "the next chapter", ["el", "siguiente", "capítulo", "la despedida"], ["siguiente", "el capítulo"]),
        ],
      },
    ],
  },
  // ==================== SECTION 9 ====================
  {
    id: "section-9",
    title: "Section 9: Verb Conjugation",
    description: "Conjugate regular -AR, -ER, -IR verbs and the key irregulars, person by person",
    units: [
      {
        title: "-AR Verbs: Hablar",
        description: "To speak, in every person",
        words: [w("yo hablo", "I speak"), w("tú hablas", "you speak"), w("él habla", "he speaks"), w("nosotros hablamos", "we speak"), w("ustedes hablan", "you all speak"), w("ellos hablan", "they speak")],
        sentences: [
          s("yo hablo y tú hablas", "I speak and you speak", ["yo hablo", "y", "tú hablas", "él habla"], ["yo hablo", "tú hablas"]),
          s("nosotros hablamos mucho", "we speak a lot", ["nosotros hablamos", "mucho", "ustedes hablan", "ellos hablan"], ["nosotros hablamos", "mucho"]),
          s("ellos hablan español", "they speak Spanish", ["ellos hablan", "español", "yo hablo", "él habla"], ["ellos hablan"]),
        ],
      },
      {
        title: "-ER Verbs: Comer",
        description: "To eat, in every person",
        words: [w("yo como", "I eat"), w("tú comes", "you eat"), w("él come", "he eats"), w("nosotros comemos", "we eat"), w("ustedes comen", "you all eat"), w("ellos comen", "they eat")],
        sentences: [
          s("yo como y tú comes", "I eat and you eat", ["yo como", "y", "tú comes", "él come"], ["yo como", "tú comes"]),
          s("nosotros comemos mucho", "we eat a lot", ["nosotros comemos", "mucho", "ustedes comen", "ellos comen"], ["nosotros comemos", "mucho"]),
          s("ellos comen la manzana", "they eat the apple", ["ellos comen", "la manzana", "yo como", "él come"], ["ellos comen", "la manzana"]),
        ],
      },
      {
        title: "-IR Verbs: Vivir",
        description: "To live, in every person",
        words: [w("yo vivo", "I live"), w("tú vives", "you live"), w("él vive", "he lives"), w("nosotros vivimos", "we live"), w("ustedes viven", "you all live"), w("ellos viven", "they live")],
        sentences: [
          s("yo vivo y tú vives", "I live and you live", ["yo vivo", "y", "tú vives", "él vive"], ["yo vivo", "tú vives"]),
          s("nosotros vivimos en la ciudad", "we live in the city", ["nosotros vivimos", "en", "la ciudad", "ustedes viven"], ["nosotros vivimos", "la ciudad"]),
          s("ellos viven en la casa", "they live in the house", ["ellos viven", "en", "la casa", "yo vivo"], ["ellos viven", "la casa"]),
        ],
      },
      {
        title: "-AR Verbs: Trabajar",
        description: "To work — the -AR pattern again",
        words: [w("yo trabajo", "I work"), w("tú trabajas", "you work"), w("él trabaja", "he works"), w("nosotros trabajamos", "we work"), w("ustedes trabajan", "you all work"), w("ellos trabajan", "they work")],
        sentences: [
          s("yo trabajo hoy", "I work today", ["yo trabajo", "hoy", "tú trabajas", "él trabaja"], ["yo trabajo", "hoy"]),
          s("nosotros trabajamos mucho", "we work a lot", ["nosotros trabajamos", "mucho", "ustedes trabajan", "ellos trabajan"], ["nosotros trabajamos", "mucho"]),
          s("ellos trabajan mañana", "they work tomorrow", ["ellos trabajan", "mañana", "yo trabajo", "él trabaja"], ["ellos trabajan", "mañana"]),
        ],
      },
      {
        title: "Irregular: Ser",
        description: "To be (permanent) — soy, eres, es…",
        words: [w("yo soy", "I am"), w("tú eres", "you are"), w("él es", "he is"), w("nosotros somos", "we are"), w("ustedes son", "you all are"), w("ellos son", "they are")],
        sentences: [
          s("yo soy el amigo", "I am the friend", ["yo soy", "el amigo", "tú eres", "él es"], ["yo soy", "el amigo"]),
          s("nosotros somos la familia", "we are the family", ["nosotros somos", "la familia", "ustedes son", "ellos son"], ["nosotros somos", "la familia"]),
          s("ellos son la familia", "they are the family", ["ellos son", "la familia", "yo soy", "él es"], ["ellos son", "la familia"]),
        ],
      },
      {
        title: "Irregular: Estar",
        description: "To be (feeling/place) — estoy, estás, está…",
        words: [w("yo estoy", "I am (feeling)"), w("tú estás", "you are (feeling)"), w("él está", "he is (feeling)"), w("nosotros estamos", "we are (feeling)"), w("ustedes están", "you all are (feeling)"), w("ellos están", "they are (feeling)")],
        sentences: [
          s("yo estoy feliz", "I am happy", ["yo estoy", "feliz", "tú estás", "él está"], ["yo estoy", "feliz"]),
          s("nosotros estamos bien", "we are well", ["nosotros estamos", "bien", "ustedes están", "ellos están"], ["nosotros estamos", "bien"]),
          s("él está triste", "he is sad", ["él está", "triste", "ellos están", "yo estoy"], ["él está", "triste"]),
        ],
      },
      {
        title: "Irregular: Ir",
        description: "To go — voy, vas, va…",
        words: [w("yo voy", "I go"), w("tú vas", "you go"), w("él va", "he goes"), w("nosotros vamos", "we go"), w("ustedes van", "you all go"), w("ellos van", "they go")],
        sentences: [
          s("yo voy a la escuela", "I go to the school", ["yo voy", "a", "la escuela", "tú vas"], ["yo voy", "la escuela"]),
          s("nosotros vamos a la playa", "we go to the beach", ["nosotros vamos", "a", "la playa", "ustedes van"], ["nosotros vamos", "la playa"]),
          s("ellos van a la ciudad", "they go to the city", ["ellos van", "a", "la ciudad", "yo voy"], ["ellos van", "la ciudad"]),
        ],
      },
      {
        title: "Irregular: Tener",
        description: "To have — tengo, tienes, tiene…",
        words: [w("yo tengo", "I have"), w("tú tienes", "you have"), w("él tiene", "he has"), w("nosotros tenemos", "we have"), w("ustedes tienen", "you all have"), w("ellos tienen", "they have")],
        sentences: [
          s("yo tengo un perro", "I have a dog", ["yo tengo", "un", "perro", "tú tienes"], ["yo tengo", "el perro"]),
          s("nosotros tenemos una casa", "we have a house", ["nosotros tenemos", "una", "casa", "ustedes tienen"], ["nosotros tenemos", "la casa"]),
          s("ellos tienen un gato", "they have a cat", ["ellos tienen", "un", "gato", "yo tengo"], ["ellos tienen", "el gato"]),
        ],
      },
    ],
  },
  // ==================== SECTION 10 ====================
  {
    id: "section-10",
    title: "Section 10: Grammar",
    description: "Articles, plurals, agreement, negation, questions — the rules that hold Spanish together",
    units: [
      {
        title: "Articles & Gender",
        description: "Un, una — every noun has a gender",
        words: [w("un", "a (masculine)"), w("una", "a (feminine)"), w("el chico", "the guy"), w("la chica", "the gal"), w("un poco", "a little"), w("la cosa", "the thing")],
        sentences: [
          s("un poco más", "a little more", ["un poco", "más", "una", "la cosa"], ["un poco", "más"]),
          s("el chico y la chica", "the guy and the gal", ["el chico", "y", "la chica", "un"], ["el chico", "la chica"]),
          s("la cosa es azul", "the thing is blue", ["la cosa", "es", "azul", "una"], ["la cosa", "azul"]),
        ],
      },
      {
        title: "Plurals",
        description: "Los, las — more than one of everything",
        words: [w("los libros", "the books"), w("las casas", "the houses"), w("los amigos", "the friends"), w("las flores", "the flowers"), w("muchos", "many (masculine)"), w("muchas", "many (feminine)")],
        sentences: [
          s("los libros y las flores", "the books and the flowers", ["los libros", "y", "las flores", "muchos"], ["los libros", "las flores"]),
          s("muchos amigos", "many friends", ["muchos", "amigos", "muchas", "los libros"], ["muchos", "los amigos"]),
          s("muchas casas", "many houses", ["muchas", "casas", "muchos", "las flores"], ["muchas", "las casas"]),
        ],
      },
      {
        title: "Adjective Agreement",
        description: "Adjectives match their noun's gender",
        words: [w("bueno", "good (masculine)"), w("buena", "good (feminine)"), w("nuevo", "new (masculine)"), w("nueva", "new (feminine)"), w("alta", "tall (feminine)"), w("bonita", "pretty (feminine)")],
        sentences: [
          s("el libro es bueno", "the book is good", ["el libro", "es", "bueno", "buena"], ["el libro", "bueno"]),
          s("la casa es nueva", "the house is new", ["la casa", "es", "nueva", "nuevo"], ["la casa", "nueva"]),
          s("la mujer es alta", "the woman is tall", ["la mujer", "es", "alta", "bonita"], ["la mujer", "alta"]),
        ],
      },
      {
        title: "Negation",
        description: "No, nothing, nobody, never",
        words: [w("no", "not"), w("nada", "nothing"), w("nadie", "nobody"), w("nunca", "never"), w("tampoco", "neither"), w("todavía no", "not yet")],
        sentences: [
          s("yo no hablo", "I do not speak", ["yo", "no", "hablo", "nunca"], ["no", "yo hablo"]),
          s("nadie come nada", "nobody eats anything", ["nadie", "come", "nada", "nunca"], ["nadie", "nada"]),
          s("yo nunca bebo vino", "I never drink wine", ["yo", "nunca", "bebo", "vino", "tampoco"], ["nunca", "el vino"]),
        ],
      },
      {
        title: "Question Words",
        description: "What, who, where, when, why, how",
        words: [w("¿qué?", "what?"), w("¿quién?", "who?"), w("¿dónde?", "where?"), w("¿cuándo?", "when?"), w("¿por qué?", "why?"), w("¿cómo?", "how?")],
        sentences: [
          s("dónde está el gato", "where is the cat", ["dónde", "está", "el gato", "qué"], ["¿dónde?", "el gato"]),
          s("qué es esto", "what is this", ["qué", "es", "esto", "quién"], ["¿qué?"]),
          s("por qué no", "why not", ["por", "qué", "no", "cómo"], ["¿por qué?", "no"]),
        ],
      },
      {
        title: "Prepositions",
        description: "In, with, without, on top of, under",
        words: [w("en", "in"), w("con", "with"), w("sin", "without"), w("sobre", "on top of"), w("debajo de", "under"), w("entre", "between")],
        sentences: [
          s("el gato está sobre la mesa", "the cat is on top of the table", ["el gato", "está", "sobre", "la mesa", "debajo de"], ["sobre", "el gato", "la mesa"]),
          s("café sin leche", "coffee without milk", ["café", "sin", "leche", "con"], ["sin", "el café", "la leche"]),
          s("yo vivo con mi familia", "I live with my family", ["yo vivo", "con", "mi", "familia", "sin"], ["con", "yo vivo", "la familia"]),
        ],
      },
      {
        title: "Possessives",
        description: "My, your, his, her, our",
        words: [w("mi", "my"), w("tu", "your"), w("su", "his or her"), w("nuestro", "our"), w("nuestra", "our (feminine)"), w("mis", "my (plural)")],
        sentences: [
          s("mi casa es tu casa", "my house is your house", ["mi", "casa", "es", "tu", "su"], ["mi", "tu", "la casa"]),
          s("su perro es grande", "his dog is big", ["su", "perro", "es", "grande", "nuestro"], ["su", "el perro", "grande"]),
          s("nuestra familia es grande", "our family is big", ["nuestra", "familia", "es", "grande", "mis"], ["nuestra", "la familia", "grande"]),
        ],
      },
      {
        title: "Comparisons",
        description: "More than, less than, the best",
        words: [w("más que", "more than"), w("menos que", "less than"), w("el mejor", "the best"), w("el peor", "the worst"), w("mayor", "older"), w("menor", "younger")],
        sentences: [
          s("el perro es más grande que el gato", "the dog is bigger than the cat", ["el perro", "es", "más", "grande", "que", "el gato"], ["más que", "el perro", "el gato"]),
          s("mi hermano es mayor", "my brother is older", ["mi", "hermano", "es", "mayor", "menor"], ["mayor", "el hermano"]),
          s("hoy es el mejor día", "today is the best day", ["hoy", "es", "el mejor", "día", "el peor"], ["el mejor", "hoy", "el día"]),
        ],
      },
    ],
  },
];
