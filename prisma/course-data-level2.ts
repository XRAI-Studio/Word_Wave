// Level 2 course content: one harder section per Level 1 theme.
// All vocabulary here is new (never taught at Level 1).

import { w, s, type SectionDef } from "./course-types";

export const level2Sections: SectionDef[] = [
  // ==================== L2 · FOUNDATIONS ====================
  {
    id: "section-l2-1",
    title: "Foundations — Level 2",
    description: "Richer greetings, people, food, and the world at home",
    units: [
      {
        title: "Greetings II",
        description: "Good afternoon, see you soon, delighted",
        words: [w("buenas tardes", "good afternoon"), w("bienvenidos", "welcome (plural)"), w("hasta mañana", "see you tomorrow"), w("hasta pronto", "see you soon"), w("igualmente", "likewise"), w("encantado", "delighted")],
        sentences: [
          s("buenas tardes y bienvenidos", "good afternoon and welcome", ["buenas tardes", "y", "bienvenidos", "hasta pronto"], ["buenas tardes", "bienvenidos"]),
          s("hasta mañana amigo", "see you tomorrow friend", ["hasta mañana", "amigo", "hasta pronto", "igualmente"], ["hasta mañana", "el amigo"]),
          s("encantado igualmente", "delighted likewise", ["encantado", "igualmente", "bienvenidos", "hasta mañana"], ["encantado", "igualmente"]),
        ],
      },
      {
        title: "People II",
        description: "Neighbors, strangers, and everyone else",
        words: [w("el vecino", "the neighbor"), w("la gente", "the people"), w("el bebé", "the baby"), w("el adulto", "the adult"), w("el extraño", "the stranger"), w("el compañero", "the classmate")],
        sentences: [
          s("el vecino y la gente", "the neighbor and the people", ["el vecino", "y", "la gente", "el bebé"], ["el vecino", "la gente"]),
          s("el bebé es pequeño", "the baby is small", ["el bebé", "es", "pequeño", "el adulto"], ["el bebé", "pequeño"]),
          s("el compañero es mi amigo", "the classmate is my friend", ["el compañero", "es", "mi", "amigo", "el extraño"], ["el compañero", "el amigo"]),
        ],
      },
      {
        title: "Food II",
        description: "Meat, chicken, salad — the full plate",
        words: [w("la carne", "the meat"), w("el pollo", "the chicken"), w("el pescado", "the fish (food)"), w("la ensalada", "the salad"), w("la fruta", "the fruit"), w("la verdura", "the vegetable")],
        sentences: [
          s("la carne y el pollo", "the meat and the chicken", ["la carne", "y", "el pollo", "el pescado"], ["la carne", "el pollo"]),
          s("yo como la ensalada", "I eat the salad", ["yo como", "la ensalada", "la fruta", "el pollo"], ["yo como", "la ensalada"]),
          s("la fruta y la verdura", "the fruit and the vegetable", ["la fruta", "y", "la verdura", "la carne"], ["la fruta", "la verdura"]),
        ],
      },
      {
        title: "Drinks II",
        description: "Soda, beer, and a bottle of lemonade",
        words: [w("el refresco", "the soda"), w("la cerveza", "the beer"), w("el hielo", "the ice"), w("la botella", "the bottle"), w("la limonada", "the lemonade"), w("el batido", "the milkshake")],
        sentences: [
          s("el refresco y el hielo", "the soda and the ice", ["el refresco", "y", "el hielo", "la cerveza"], ["el refresco", "el hielo"]),
          s("la botella de limonada", "the bottle of lemonade", ["la botella", "de", "limonada", "el batido"], ["la botella", "la limonada"]),
          s("yo bebo el batido", "I drink the milkshake", ["yo bebo", "el batido", "la cerveza", "el refresco"], ["yo bebo", "el batido"]),
        ],
      },
      {
        title: "Around the House",
        description: "Bathroom, garden, roof, and floor",
        words: [w("el baño", "the bathroom"), w("la sala", "the living room"), w("el jardín", "the garden"), w("la escalera", "the stairs"), w("el techo", "the roof"), w("el suelo", "the floor")],
        sentences: [
          s("el baño y la sala", "the bathroom and the living room", ["el baño", "y", "la sala", "el jardín"], ["el baño", "la sala"]),
          s("el jardín es verde", "the garden is green", ["el jardín", "es", "verde", "el techo"], ["el jardín", "verde"]),
          s("la escalera y el suelo", "the stairs and the floor", ["la escalera", "y", "el suelo", "el techo"], ["la escalera", "el suelo"]),
        ],
      },
      {
        title: "Daily Objects",
        description: "Chairs, mirrors, lamps, and clocks",
        words: [w("la silla", "the chair"), w("el espejo", "the mirror"), w("la lámpara", "the lamp"), w("el reloj", "the clock"), w("el sofá", "the sofa"), w("la alfombra", "the rug")],
        sentences: [
          s("la silla y el sofá", "the chair and the sofa", ["la silla", "y", "el sofá", "el espejo"], ["la silla", "el sofá"]),
          s("la lámpara es nueva", "the lamp is new", ["la lámpara", "es", "nueva", "el reloj"], ["la lámpara", "nueva"]),
          s("el espejo y la alfombra", "the mirror and the rug", ["el espejo", "y", "la alfombra", "la silla"], ["el espejo", "la alfombra"]),
        ],
      },
      {
        title: "Wild Animals",
        description: "Lions, bears, monkeys, and snakes",
        words: [w("el león", "the lion"), w("el oso", "the bear"), w("el mono", "the monkey"), w("la serpiente", "the snake"), w("el ratón", "the mouse"), w("la tortuga", "the turtle")],
        sentences: [
          s("el león y el oso", "the lion and the bear", ["el león", "y", "el oso", "el mono"], ["el león", "el oso"]),
          s("la serpiente es verde", "the snake is green", ["la serpiente", "es", "verde", "la tortuga"], ["la serpiente", "verde"]),
          s("el ratón es pequeño", "the mouse is small", ["el ratón", "es", "pequeño", "el mono"], ["el ratón", "pequeño"]),
        ],
      },
      {
        title: "Big Numbers",
        description: "Twenty, thirty, one hundred, one thousand",
        words: [w("veinte", "twenty"), w("treinta", "thirty"), w("cuarenta", "forty"), w("cincuenta", "fifty"), w("cien", "one hundred"), w("mil", "one thousand")],
        sentences: [
          s("veinte y treinta", "twenty and thirty", ["veinte", "y", "treinta", "cien"], ["veinte", "treinta"]),
          s("cuarenta y cincuenta", "forty and fifty", ["cuarenta", "y", "cincuenta", "mil"], ["cuarenta", "cincuenta"]),
          s("yo tengo cien libros", "I have one hundred books", ["yo tengo", "cien", "libros", "mil"], ["yo tengo", "cien", "los libros"]),
        ],
      },
    ],
  },
  // ==================== L2 · BUILDING SENTENCES ====================
  {
    id: "section-l2-2",
    title: "Building Sentences — Level 2",
    description: "Extended family, months, weather fronts, and telling time",
    units: [
      {
        title: "Extended Family",
        description: "Grandparents, uncles, aunts, and cousins",
        words: [w("el abuelo", "the grandfather"), w("la abuela", "the grandmother"), w("el tío", "the uncle"), w("la tía", "the aunt"), w("el primo", "the cousin"), w("el sobrino", "the nephew")],
        sentences: [
          s("el abuelo y la abuela", "the grandfather and the grandmother", ["el abuelo", "y", "la abuela", "el tío"], ["el abuelo", "la abuela"]),
          s("el tío y la tía", "the uncle and the aunt", ["el tío", "y", "la tía", "el primo"], ["el tío", "la tía"]),
          s("el primo y el sobrino", "the cousin and the nephew", ["el primo", "y", "el sobrino", "la abuela"], ["el primo", "el sobrino"]),
        ],
      },
      {
        title: "Winter Clothing",
        description: "Coats, boots, scarves, and gloves",
        words: [w("el abrigo", "the coat"), w("la falda", "the skirt"), w("las botas", "the boots"), w("la bufanda", "the scarf"), w("los guantes", "the gloves"), w("el cinturón", "the belt")],
        sentences: [
          s("el abrigo y la bufanda", "the coat and the scarf", ["el abrigo", "y", "la bufanda", "las botas"], ["el abrigo", "la bufanda"]),
          s("las botas son negras", "the boots are black", ["las botas", "son", "negras", "los guantes"], ["las botas", "negro"]),
          s("la falda y el cinturón", "the skirt and the belt", ["la falda", "y", "el cinturón", "el abrigo"], ["la falda", "el cinturón"]),
        ],
      },
      {
        title: "City Places",
        description: "Restaurants, libraries, pharmacies",
        words: [w("el restaurante", "the restaurant"), w("el cine", "the movie theater"), w("la biblioteca", "the library"), w("la farmacia", "the pharmacy"), w("el supermercado", "the supermarket"), w("la panadería", "the bakery")],
        sentences: [
          s("el restaurante y el cine", "the restaurant and the movie theater", ["el restaurante", "y", "el cine", "la biblioteca"], ["el restaurante", "el cine"]),
          s("yo voy a la biblioteca", "I go to the library", ["yo voy", "a", "la biblioteca", "la farmacia"], ["yo voy", "la biblioteca"]),
          s("el supermercado y la panadería", "the supermarket and the bakery", ["el supermercado", "y", "la panadería", "el cine"], ["el supermercado", "la panadería"]),
        ],
      },
      {
        title: "Verbs III",
        description: "Open, close, look for, find",
        words: [w("yo abro", "I open"), w("yo cierro", "I close"), w("yo busco", "I look for"), w("yo encuentro", "I find"), w("yo pierdo", "I lose"), w("yo llevo", "I carry")],
        sentences: [
          s("yo abro la puerta", "I open the door", ["yo abro", "la puerta", "yo cierro", "la ventana"], ["yo abro", "la puerta"]),
          s("yo busco el libro", "I look for the book", ["yo busco", "el libro", "yo encuentro", "yo pierdo"], ["yo busco", "el libro"]),
          s("yo llevo la maleta", "I carry the suitcase", ["yo llevo", "la maleta", "yo pierdo", "yo abro"], ["yo llevo", "la maleta"]),
        ],
      },
      {
        title: "Months",
        description: "January through December",
        words: [w("enero", "January"), w("febrero", "February"), w("marzo", "March"), w("junio", "June"), w("julio", "July"), w("diciembre", "December")],
        sentences: [
          s("enero y febrero", "January and February", ["enero", "y", "febrero", "marzo"], ["enero", "febrero"]),
          s("junio y julio", "June and July", ["junio", "y", "julio", "diciembre"], ["junio", "julio"]),
          s("diciembre es el mejor mes", "December is the best month", ["diciembre", "es", "el mejor", "mes", "marzo"], ["diciembre", "el mejor", "el mes"]),
        ],
      },
      {
        title: "Weather II",
        description: "Storms, lightning, fog, and clouds",
        words: [w("la tormenta", "the storm"), w("el relámpago", "the lightning"), w("la niebla", "the fog"), w("la nube", "the cloud"), w("húmedo", "humid"), w("seco", "dry")],
        sentences: [
          s("la tormenta y el relámpago", "the storm and the lightning", ["la tormenta", "y", "el relámpago", "la niebla"], ["la tormenta", "el relámpago"]),
          s("la niebla y la nube", "the fog and the cloud", ["la niebla", "y", "la nube", "la tormenta"], ["la niebla", "la nube"]),
          s("el verano es seco", "the summer is dry", ["el verano", "es", "seco", "húmedo"], ["el verano", "seco"]),
        ],
      },
      {
        title: "The Body II",
        description: "Arms, legs, shoulders, and fingers",
        words: [w("el brazo", "the arm"), w("la pierna", "the leg"), w("el hombro", "the shoulder"), w("la espalda", "the back"), w("el cuello", "the neck"), w("el dedo", "the finger")],
        sentences: [
          s("el brazo y la pierna", "the arm and the leg", ["el brazo", "y", "la pierna", "el hombro"], ["el brazo", "la pierna"]),
          s("el hombro y el cuello", "the shoulder and the neck", ["el hombro", "y", "el cuello", "la espalda"], ["el hombro", "el cuello"]),
          s("el dedo es pequeño", "the finger is small", ["el dedo", "es", "pequeño", "la espalda"], ["el dedo", "pequeño"]),
        ],
      },
      {
        title: "Telling Time",
        description: "Hours, minutes, noon, and midnight",
        words: [w("la hora", "the hour"), w("el minuto", "the minute"), w("el segundo", "the second"), w("la medianoche", "midnight"), w("el mediodía", "noon"), w("en punto", "o'clock")],
        sentences: [
          s("la hora y el minuto", "the hour and the minute", ["la hora", "y", "el minuto", "el segundo"], ["la hora", "el minuto"]),
          s("yo como al mediodía", "I eat at noon", ["yo como", "al", "mediodía", "la medianoche"], ["yo como", "el mediodía"]),
          s("la medianoche en punto", "midnight o'clock sharp", ["la medianoche", "en punto", "el mediodía", "la hora"], ["la medianoche", "en punto"]),
        ],
      },
    ],
  },
  // ==================== L2 · EVERYDAY LIFE ====================
  {
    id: "section-l2-3",
    title: "Everyday Life — Level 2",
    description: "Morning routines, chores, cooking, and the gym",
    units: [
      {
        title: "Morning Routine",
        description: "Shower, get dressed, brush up",
        words: [w("me ducho", "I shower"), w("me visto", "I get dressed"), w("el jabón", "the soap"), w("la toalla", "the towel"), w("el cepillo", "the brush"), w("el champú", "the shampoo")],
        sentences: [
          s("me ducho temprano", "I shower early", ["me ducho", "temprano", "me visto", "tarde"], ["me ducho", "temprano"]),
          s("el jabón y la toalla", "the soap and the towel", ["el jabón", "y", "la toalla", "el cepillo"], ["el jabón", "la toalla"]),
          s("el cepillo y el champú", "the brush and the shampoo", ["el cepillo", "y", "el champú", "el jabón"], ["el cepillo", "el champú"]),
        ],
      },
      {
        title: "At the Office",
        description: "Computers, printers, and deadlines",
        words: [w("el correo", "the mail"), w("la computadora", "the computer"), w("la impresora", "the printer"), w("el escritorio", "the desk"), w("el informe", "the report"), w("el plazo", "the deadline")],
        sentences: [
          s("la computadora y la impresora", "the computer and the printer", ["la computadora", "y", "la impresora", "el correo"], ["la computadora", "la impresora"]),
          s("el informe es importante", "the report is important", ["el informe", "es", "importante", "el plazo"], ["el informe", "importante"]),
          s("el correo y el escritorio", "the mail and the desk", ["el correo", "y", "el escritorio", "el informe"], ["el correo", "el escritorio"]),
        ],
      },
      {
        title: "Chores",
        description: "Clean, wash, sweep, iron",
        words: [w("yo limpio", "I clean"), w("yo lavo", "I wash"), w("yo barro", "I sweep"), w("yo plancho", "I iron"), w("la basura", "the trash"), w("el polvo", "the dust")],
        sentences: [
          s("yo limpio la cocina", "I clean the kitchen", ["yo limpio", "la cocina", "yo lavo", "yo barro"], ["yo limpio", "la cocina"]),
          s("yo lavo la ropa", "I wash the clothes", ["yo lavo", "la ropa", "yo plancho", "la basura"], ["yo lavo", "la ropa"]),
          s("la basura y el polvo", "the trash and the dust", ["la basura", "y", "el polvo", "yo barro"], ["la basura", "el polvo"]),
        ],
      },
      {
        title: "Groceries",
        description: "Bags, carts, discounts, and lists",
        words: [w("la bolsa", "the bag"), w("el carrito", "the cart"), w("la caja", "the box"), w("el descuento", "the discount"), w("la oferta", "the offer"), w("la lista", "the list")],
        sentences: [
          s("la bolsa y la caja", "the bag and the box", ["la bolsa", "y", "la caja", "el carrito"], ["la bolsa", "la caja"]),
          s("el descuento y la oferta", "the discount and the offer", ["el descuento", "y", "la oferta", "la lista"], ["el descuento", "la oferta"]),
          s("yo llevo la lista", "I carry the list", ["yo llevo", "la lista", "el carrito", "la bolsa"], ["yo llevo", "la lista"]),
        ],
      },
      {
        title: "Cooking",
        description: "Recipes, salt, pepper, oil, and sugar",
        words: [w("la receta", "the recipe"), w("el ingrediente", "the ingredient"), w("la sal", "the salt"), w("la pimienta", "the pepper"), w("el aceite", "the oil"), w("el azúcar", "the sugar")],
        sentences: [
          s("la sal y la pimienta", "the salt and the pepper", ["la sal", "y", "la pimienta", "el aceite"], ["la sal", "la pimienta"]),
          s("la receta y el ingrediente", "the recipe and the ingredient", ["la receta", "y", "el ingrediente", "el azúcar"], ["la receta", "el ingrediente"]),
          s("yo necesito el azúcar", "I need the sugar", ["yo necesito", "el azúcar", "el aceite", "la sal"], ["yo necesito", "el azúcar"]),
        ],
      },
      {
        title: "Games & Toys",
        description: "Toys, cards, chess, and puzzles",
        words: [w("el juguete", "the toy"), w("las cartas", "the playing cards"), w("el ajedrez", "chess"), w("la muñeca", "the doll"), w("el rompecabezas", "the puzzle"), w("yo dibujo", "I draw")],
        sentences: [
          s("el juguete y la muñeca", "the toy and the doll", ["el juguete", "y", "la muñeca", "las cartas"], ["el juguete", "la muñeca"]),
          s("yo juego el ajedrez", "I play chess", ["yo juego", "el ajedrez", "las cartas", "el rompecabezas"], ["yo juego", "el ajedrez"]),
          s("yo dibujo el perro", "I draw the dog", ["yo dibujo", "el perro", "la muñeca", "el juguete"], ["yo dibujo", "el perro"]),
        ],
      },
      {
        title: "At the Gym",
        description: "Weights, marathons, lifting, jumping",
        words: [w("el gimnasio", "the gym"), w("el maratón", "the marathon"), w("la pesa", "the weight"), w("yo levanto", "I lift"), w("yo salto", "I jump"), w("yo camino", "I walk")],
        sentences: [
          s("yo voy al gimnasio", "I go to the gym", ["yo voy", "al", "gimnasio", "el maratón"], ["yo voy", "el gimnasio"]),
          s("yo levanto la pesa", "I lift the weight", ["yo levanto", "la pesa", "yo salto", "yo camino"], ["yo levanto", "la pesa"]),
          s("yo camino y yo salto", "I walk and I jump", ["yo camino", "y", "yo salto", "yo levanto"], ["yo camino", "yo salto"]),
        ],
      },
      {
        title: "Pets & Care",
        description: "Cages, collars, leashes, and vets",
        words: [w("la jaula", "the cage"), w("el collar", "the collar"), w("la correa", "the leash"), w("el veterinario", "the veterinarian"), w("la pata", "the paw"), w("la cola", "the tail")],
        sentences: [
          s("el collar y la correa", "the collar and the leash", ["el collar", "y", "la correa", "la jaula"], ["el collar", "la correa"]),
          s("el perro va al veterinario", "the dog goes to the veterinarian", ["el perro", "va", "al", "veterinario", "la jaula"], ["el perro", "el veterinario"]),
          s("la pata y la cola", "the paw and the tail", ["la pata", "y", "la cola", "el collar"], ["la pata", "la cola"]),
        ],
      },
    ],
  },
  // ==================== L2 · GETTING AROUND ====================
  {
    id: "section-l2-4",
    title: "Getting Around — Level 2",
    description: "Subways, customs, pharmacies, and the great outdoors",
    units: [
      {
        title: "Directions II",
        description: "Corners, traffic lights, avenues, maps",
        words: [w("la esquina", "the corner"), w("el semáforo", "the traffic light"), w("el cruce", "the crossing"), w("la avenida", "the avenue"), w("el mapa", "the map"), w("la cuadra", "the block")],
        sentences: [
          s("la esquina y el semáforo", "the corner and the traffic light", ["la esquina", "y", "el semáforo", "el cruce"], ["la esquina", "el semáforo"]),
          s("la avenida es grande", "the avenue is big", ["la avenida", "es", "grande", "la cuadra"], ["la avenida", "grande"]),
          s("yo necesito el mapa", "I need the map", ["yo necesito", "el mapa", "el cruce", "la esquina"], ["yo necesito", "el mapa"]),
        ],
      },
      {
        title: "Public Transport",
        description: "Subways, stops, drivers, and fares",
        words: [w("el metro", "the subway"), w("la parada", "the bus stop"), w("el taxi", "the taxi"), w("el conductor", "the driver"), w("el pasajero", "the passenger"), w("la tarifa", "the fare")],
        sentences: [
          s("el metro y el taxi", "the subway and the taxi", ["el metro", "y", "el taxi", "la parada"], ["el metro", "el taxi"]),
          s("el conductor y el pasajero", "the driver and the passenger", ["el conductor", "y", "el pasajero", "la tarifa"], ["el conductor", "el pasajero"]),
          s("yo pago la tarifa", "I pay the fare", ["yo pago", "la tarifa", "la parada", "el metro"], ["yo pago", "la tarifa"]),
        ],
      },
      {
        title: "At the Hotel II",
        description: "Front desks, elevators, pillows, balconies",
        words: [w("la recepción", "the front desk"), w("el ascensor", "the elevator"), w("la almohada", "the pillow"), w("la manta", "the blanket"), w("la sábana", "the sheet"), w("el balcón", "the balcony")],
        sentences: [
          s("la recepción y el ascensor", "the front desk and the elevator", ["la recepción", "y", "el ascensor", "el balcón"], ["la recepción", "el ascensor"]),
          s("la almohada y la manta", "the pillow and the blanket", ["la almohada", "y", "la manta", "la sábana"], ["la almohada", "la manta"]),
          s("el balcón es bonito", "the balcony is pretty", ["el balcón", "es", "bonito", "la sábana"], ["el balcón", "bonito"]),
        ],
      },
      {
        title: "Border & Customs",
        description: "Visas, forms, lines, and stamps",
        words: [w("la aduana", "the customs"), w("la visa", "the visa"), w("el formulario", "the form"), w("la fila", "the line"), w("el oficial", "the officer"), w("el sello", "the stamp")],
        sentences: [
          s("la aduana y la fila", "the customs and the line", ["la aduana", "y", "la fila", "la visa"], ["la aduana", "la fila"]),
          s("yo necesito la visa", "I need the visa", ["yo necesito", "la visa", "el formulario", "el sello"], ["yo necesito", "la visa"]),
          s("el oficial y el formulario", "the officer and the form", ["el oficial", "y", "el formulario", "el sello"], ["el oficial", "el formulario"]),
        ],
      },
      {
        title: "Eating Out II",
        description: "Appetizers, specialties, spicy and sweet",
        words: [w("el aperitivo", "the appetizer"), w("la especialidad", "the specialty"), w("vegetariano", "vegetarian"), w("picante", "spicy"), w("dulce", "sweet"), w("amargo", "bitter")],
        sentences: [
          s("el aperitivo es picante", "the appetizer is spicy", ["el aperitivo", "es", "picante", "dulce"], ["el aperitivo", "picante"]),
          s("la especialidad es deliciosa", "the specialty is delicious", ["la especialidad", "es", "deliciosa", "amargo"], ["la especialidad", "delicioso"]),
          s("el postre es dulce", "the dessert is sweet", ["el postre", "es", "dulce", "amargo"], ["el postre", "dulce"]),
        ],
      },
      {
        title: "At the Pharmacy",
        description: "Pills, bandages, fevers, and coughs",
        words: [w("la pastilla", "the pill"), w("la aspirina", "the aspirin"), w("la venda", "the bandage"), w("la fiebre", "the fever"), w("la tos", "the cough"), w("el resfriado", "the cold (illness)")],
        sentences: [
          s("la pastilla y la aspirina", "the pill and the aspirin", ["la pastilla", "y", "la aspirina", "la venda"], ["la pastilla", "la aspirina"]),
          s("yo tengo la fiebre", "I have the fever", ["yo tengo", "la fiebre", "la tos", "el resfriado"], ["yo tengo", "la fiebre"]),
          s("la tos y el resfriado", "the cough and the cold", ["la tos", "y", "el resfriado", "la venda"], ["la tos", "el resfriado"]),
        ],
      },
      {
        title: "Landscapes",
        description: "Forests, deserts, islands, and valleys",
        words: [w("el bosque", "the forest"), w("el desierto", "the desert"), w("la isla", "the island"), w("el lago", "the lake"), w("la colina", "the hill"), w("el valle", "the valley")],
        sentences: [
          s("el bosque y el lago", "the forest and the lake", ["el bosque", "y", "el lago", "la isla"], ["el bosque", "el lago"]),
          s("el desierto es seco", "the desert is dry", ["el desierto", "es", "seco", "la colina"], ["el desierto", "seco"]),
          s("la colina y el valle", "the hill and the valley", ["la colina", "y", "el valle", "la isla"], ["la colina", "el valle"]),
        ],
      },
      {
        title: "Camping",
        description: "Tents, campfires, trails, and compasses",
        words: [w("la carpa", "the tent"), w("la fogata", "the campfire"), w("la linterna", "the flashlight"), w("la mochila", "the backpack"), w("el sendero", "the trail"), w("la brújula", "the compass")],
        sentences: [
          s("la carpa y la fogata", "the tent and the campfire", ["la carpa", "y", "la fogata", "la linterna"], ["la carpa", "la fogata"]),
          s("yo llevo la mochila", "I carry the backpack", ["yo llevo", "la mochila", "la brújula", "la carpa"], ["yo llevo", "la mochila"]),
          s("el sendero y la brújula", "the trail and the compass", ["el sendero", "y", "la brújula", "la fogata"], ["el sendero", "la brújula"]),
        ],
      },
    ],
  },
  // ==================== L2 · PAST & FUTURE ====================
  {
    id: "section-l2-5",
    title: "Past & Future — Level 2",
    description: "More past tense, the future tense, legends and headlines",
    units: [
      {
        title: "More Past Verbs",
        description: "I said, I put, I came, I left",
        words: [w("yo dije", "I said"), w("yo puse", "I put"), w("yo vine", "I came"), w("yo salí", "I left"), w("yo di", "I gave"), w("yo estuve", "I was (located)")],
        sentences: [
          s("yo dije la verdad", "I said the truth", ["yo dije", "la verdad", "yo puse", "yo vine"], ["yo dije", "la verdad"]),
          s("yo vine y yo salí", "I came and I left", ["yo vine", "y", "yo salí", "yo di"], ["yo vine", "yo salí"]),
          s("yo estuve en la playa", "I was at the beach", ["yo estuve", "en", "la playa", "yo puse"], ["yo estuve", "la playa"]),
        ],
      },
      {
        title: "Time Expressions",
        description: "Last night, already, back then",
        words: [w("anoche", "last night"), w("anteayer", "the day before yesterday"), w("la década", "the decade"), w("el rato", "the while"), w("entonces", "then"), w("ya", "already")],
        sentences: [
          s("anoche y anteayer", "last night and the day before yesterday", ["anoche", "y", "anteayer", "entonces"], ["anoche", "anteayer"]),
          s("ya es tarde", "it is already late", ["ya", "es", "tarde", "temprano"], ["ya", "tarde"]),
          s("entonces yo era joven", "back then I used to be young", ["entonces", "yo era", "joven", "viejo"], ["entonces", "yo era", "joven"]),
        ],
      },
      {
        title: "Growing Up",
        description: "I grew up, I learned, memories",
        words: [w("yo crecí", "I grew up"), w("yo aprendí", "I learned"), w("la juventud", "the youth"), w("el recuerdo", "the souvenir"), w("la memoria", "the memory"), w("antes", "before")],
        sentences: [
          s("yo crecí en la ciudad", "I grew up in the city", ["yo crecí", "en", "la ciudad", "yo aprendí"], ["yo crecí", "la ciudad"]),
          s("yo aprendí mucho antes", "I learned a lot before", ["yo aprendí", "mucho", "antes", "la memoria"], ["yo aprendí", "mucho", "antes"]),
          s("el recuerdo y la memoria", "the souvenir and the memory", ["el recuerdo", "y", "la memoria", "la juventud"], ["el recuerdo", "la memoria"]),
        ],
      },
      {
        title: "Future Tense",
        description: "I will go, I will be, I will have",
        words: [w("yo iré", "I will go"), w("yo seré", "I will be"), w("yo tendré", "I will have"), w("yo haré", "I will do"), w("yo veré", "I will see"), w("yo diré", "I will say")],
        sentences: [
          s("yo iré a la playa", "I will go to the beach", ["yo iré", "a", "la playa", "yo seré"], ["yo iré", "la playa"]),
          s("yo seré famoso", "I will be famous", ["yo seré", "famoso", "rico", "yo tendré"], ["yo seré", "famoso"]),
          s("yo veré el mundo", "I will see the world", ["yo veré", "el mundo", "yo haré", "yo diré"], ["yo veré", "el mundo"]),
        ],
      },
      {
        title: "Predictions",
        description: "Forecasts, possibilities, certainty",
        words: [w("el pronóstico", "the forecast"), w("la posibilidad", "the possibility"), w("probable", "likely"), w("imposible", "impossible"), w("seguro", "certain"), w("tal vez", "perhaps")],
        sentences: [
          s("el pronóstico es seguro", "the forecast is certain", ["el pronóstico", "es", "seguro", "probable"], ["el pronóstico", "seguro"]),
          s("la posibilidad es probable", "the possibility is likely", ["la posibilidad", "es", "probable", "imposible"], ["la posibilidad", "probable"]),
          s("tal vez es imposible", "perhaps it is impossible", ["tal vez", "es", "imposible", "seguro"], ["tal vez", "imposible"]),
        ],
      },
      {
        title: "Ambitions",
        description: "Objectives, effort, discipline, talent",
        words: [w("el objetivo", "the objective"), w("el esfuerzo", "the effort"), w("la disciplina", "the discipline"), w("el talento", "the talent"), w("la oportunidad", "the opportunity"), w("yo lograré", "I will achieve")],
        sentences: [
          s("el objetivo y el esfuerzo", "the objective and the effort", ["el objetivo", "y", "el esfuerzo", "el talento"], ["el objetivo", "el esfuerzo"]),
          s("la disciplina y el talento", "the discipline and the talent", ["la disciplina", "y", "el talento", "la oportunidad"], ["la disciplina", "el talento"]),
          s("yo lograré la meta", "I will achieve the goal", ["yo lograré", "la meta", "la oportunidad", "el objetivo"], ["yo lograré", "la meta"]),
        ],
      },
      {
        title: "Legends",
        description: "Myths, dragons, castles, and treasure",
        words: [w("la leyenda", "the legend"), w("el mito", "the myth"), w("el dragón", "the dragon"), w("el castillo", "the castle"), w("el tesoro", "the treasure"), w("la princesa", "the princess")],
        sentences: [
          s("la leyenda y el mito", "the legend and the myth", ["la leyenda", "y", "el mito", "el dragón"], ["la leyenda", "el mito"]),
          s("el dragón y el castillo", "the dragon and the castle", ["el dragón", "y", "el castillo", "el tesoro"], ["el dragón", "el castillo"]),
          s("la princesa encuentra el tesoro", "the princess finds the treasure", ["la princesa", "encuentra", "el tesoro", "el castillo"], ["la princesa", "el tesoro"]),
        ],
      },
      {
        title: "Current Events",
        description: "Reporters, headlines, sources, witnesses",
        words: [w("el reportero", "the reporter"), w("el titular", "the headline"), w("el canal", "the channel"), w("la fuente", "the source"), w("el testigo", "the witness"), w("en vivo", "live (broadcast)")],
        sentences: [
          s("el reportero y el titular", "the reporter and the headline", ["el reportero", "y", "el titular", "el canal"], ["el reportero", "el titular"]),
          s("la fuente y el testigo", "the source and the witness", ["la fuente", "y", "el testigo", "en vivo"], ["la fuente", "el testigo"]),
          s("el canal está en vivo", "the channel is live", ["el canal", "está", "en vivo", "el titular"], ["el canal", "en vivo"]),
        ],
      },
    ],
  },
  // ==================== L2 · CONVERSATIONS ====================
  {
    id: "section-l2-6",
    title: "Conversations — Level 2",
    description: "Introductions, moods, weddings, and keeping the peace",
    units: [
      {
        title: "Introductions",
        description: "My name is, where are you from",
        words: [w("¿qué pasa?", "what's happening?"), w("me llamo", "my name is"), w("¿de dónde eres?", "where are you from?"), w("yo soy de", "I am from"), w("el nombre", "the name"), w("el apellido", "the last name")],
        sentences: [
          s("me llamo Ana", "my name is Ana", ["me llamo", "Ana", "el nombre", "yo soy de"], ["me llamo", "el nombre"]),
          s("yo soy de México", "I am from Mexico", ["yo soy de", "México", "me llamo", "el apellido"], ["yo soy de"]),
          s("el nombre y el apellido", "the name and the last name", ["el nombre", "y", "el apellido", "me llamo"], ["el nombre", "el apellido"]),
        ],
      },
      {
        title: "Going Out",
        description: "Concerts, tickets, see you there",
        words: [w("el concierto", "the concert"), w("la entrada", "the ticket (entry)"), w("el lugar", "the place"), w("nos vemos", "see you"), w("¿quieres venir?", "do you want to come?"), w("por supuesto", "certainly")],
        sentences: [
          s("el concierto y la entrada", "the concert and the ticket", ["el concierto", "y", "la entrada", "el lugar"], ["el concierto", "la entrada"]),
          s("quieres venir por supuesto", "do you want to come certainly", ["quieres", "venir", "por supuesto", "nos vemos"], ["¿quieres venir?", "por supuesto"]),
          s("nos vemos en el lugar", "see you at the place", ["nos vemos", "en", "el lugar", "el concierto"], ["nos vemos", "el lugar"]),
        ],
      },
      {
        title: "Texting & Email",
        description: "Emails, passwords, files, replies",
        words: [w("el correo electrónico", "the email"), w("la contraseña", "the password"), w("el archivo", "the file"), w("adjunto", "attached"), w("yo respondo", "I reply"), w("la firma", "the signature")],
        sentences: [
          s("el correo electrónico y el archivo", "the email and the file", ["el correo electrónico", "y", "el archivo", "la firma"], ["el correo electrónico", "el archivo"]),
          s("yo necesito la contraseña", "I need the password", ["yo necesito", "la contraseña", "adjunto", "la firma"], ["yo necesito", "la contraseña"]),
          s("el archivo está adjunto", "the file is attached", ["el archivo", "está", "adjunto", "la contraseña"], ["el archivo", "adjunto"]),
        ],
      },
      {
        title: "Descriptions II",
        description: "Thin, blond, glasses, and beards",
        words: [w("delgado", "thin"), w("gordo", "fat"), w("rubio", "blond"), w("moreno", "dark-haired"), w("las gafas", "the glasses"), w("la barba", "the beard")],
        sentences: [
          s("el hombre es delgado", "the man is thin", ["el hombre", "es", "delgado", "gordo"], ["el hombre", "delgado"]),
          s("el niño es rubio", "the boy is blond", ["el niño", "es", "rubio", "moreno"], ["el niño", "rubio"]),
          s("las gafas y la barba", "the glasses and the beard", ["las gafas", "y", "la barba", "delgado"], ["las gafas", "la barba"]),
        ],
      },
      {
        title: "Moods",
        description: "Excited, nervous, bored, calm",
        words: [w("emocionado", "excited"), w("nervioso", "nervous"), w("aburrido", "bored"), w("enojado", "angry"), w("preocupado", "worried"), w("tranquilo", "calm")],
        sentences: [
          s("yo estoy emocionado", "I am excited", ["yo estoy", "emocionado", "nervioso", "aburrido"], ["yo estoy", "emocionado"]),
          s("él está enojado", "he is angry", ["él está", "enojado", "tranquilo", "preocupado"], ["él está", "enojado"]),
          s("tranquilo y no preocupado", "calm and not worried", ["tranquilo", "y", "no", "preocupado", "nervioso"], ["tranquilo", "preocupado", "no"]),
        ],
      },
      {
        title: "Love & Weddings",
        description: "Friendship, couples, rings, and kisses",
        words: [w("la amistad", "the friendship"), w("la pareja", "the couple"), w("la boda", "the wedding"), w("el anillo", "the ring"), w("el abrazo", "the hug"), w("el beso", "the kiss")],
        sentences: [
          s("la amistad y el amor", "the friendship and the love", ["la amistad", "y", "el amor", "la boda"], ["la amistad", "el amor"]),
          s("la pareja y el anillo", "the couple and the ring", ["la pareja", "y", "el anillo", "el beso"], ["la pareja", "el anillo"]),
          s("el abrazo y el beso", "the hug and the kiss", ["el abrazo", "y", "el beso", "el anillo"], ["el abrazo", "el beso"]),
        ],
      },
      {
        title: "Making Peace",
        description: "Quarrels, blame, forgiveness, patience",
        words: [w("la discusión", "the quarrel"), w("la culpa", "the blame"), w("la mentira", "the lie"), w("la verdad", "the truth"), w("yo perdono", "I forgive"), w("la paciencia", "the patience")],
        sentences: [
          s("la discusión y la culpa", "the quarrel and the blame", ["la discusión", "y", "la culpa", "la mentira"], ["la discusión", "la culpa"]),
          s("la mentira y la verdad", "the lie and the truth", ["la mentira", "y", "la verdad", "la culpa"], ["la mentira", "la verdad"]),
          s("yo perdono con paciencia", "I forgive with patience", ["yo perdono", "con", "paciencia", "la discusión"], ["yo perdono", "la paciencia"]),
        ],
      },
      {
        title: "Etiquette",
        description: "Favors, promises, respect, apologies",
        words: [w("el favor", "the favor"), w("la promesa", "the promise"), w("el respeto", "the respect"), w("la disculpa", "the apology"), w("cortés", "polite"), w("el saludo", "the greeting")],
        sentences: [
          s("el favor y la promesa", "the favor and the promise", ["el favor", "y", "la promesa", "el respeto"], ["el favor", "la promesa"]),
          s("la disculpa es cortés", "the apology is polite", ["la disculpa", "es", "cortés", "el saludo"], ["la disculpa", "cortés"]),
          s("el saludo y el respeto", "the greeting and the respect", ["el saludo", "y", "el respeto", "la promesa"], ["el saludo", "el respeto"]),
        ],
      },
    ],
  },
  // ==================== L2 · THE WIDER WORLD ====================
  {
    id: "section-l2-7",
    title: "The Wider World — Level 2",
    description: "More countries, instruments, empires, and the environment",
    units: [
      {
        title: "More Countries",
        description: "Argentina, Colombia, Peru, and beyond",
        words: [w("Argentina", "Argentina"), w("Colombia", "Colombia"), w("Perú", "Peru"), w("Chile", "Chile"), w("Cuba", "Cuba"), w("Guatemala", "Guatemala")],
        sentences: [
          s("Argentina y Chile", "Argentina and Chile", ["Argentina", "y", "Chile", "Perú"], ["Argentina", "Chile"]),
          s("Colombia y Perú", "Colombia and Peru", ["Colombia", "y", "Perú", "Cuba"], ["Colombia", "Perú"]),
          s("Cuba es una isla", "Cuba is an island", ["Cuba", "es", "una", "isla", "Guatemala"], ["Cuba", "la isla"]),
        ],
      },
      {
        title: "Nationalities",
        description: "Mexican, Argentine, French, Japanese",
        words: [w("mexicano", "Mexican"), w("argentino", "Argentine"), w("americano", "American"), w("francés", "French"), w("italiano", "Italian"), w("japonés", "Japanese")],
        sentences: [
          s("el hombre es mexicano", "the man is Mexican", ["el hombre", "es", "mexicano", "argentino"], ["el hombre", "mexicano"]),
          s("mi amigo es francés", "my friend is French", ["mi", "amigo", "es", "francés", "italiano"], ["el amigo", "francés"]),
          s("el artista es japonés", "the artist is Japanese", ["el artista", "es", "japonés", "americano"], ["el artista", "japonés"]),
        ],
      },
      {
        title: "Geography",
        description: "Continents, oceans, capitals, regions",
        words: [w("el continente", "the continent"), w("el océano", "the ocean"), w("la capital", "the capital"), w("la región", "the region"), w("el hemisferio", "the hemisphere"), w("el ecuador", "the equator")],
        sentences: [
          s("el continente y el océano", "the continent and the ocean", ["el continente", "y", "el océano", "la capital"], ["el continente", "el océano"]),
          s("la capital de la región", "the capital of the region", ["la capital", "de", "la región", "el hemisferio"], ["la capital", "la región"]),
          s("el ecuador y el hemisferio", "the equator and the hemisphere", ["el ecuador", "y", "el hemisferio", "el océano"], ["el ecuador", "el hemisferio"]),
        ],
      },
      {
        title: "Instruments",
        description: "Pianos, violins, trumpets, and drums",
        words: [w("el piano", "the piano"), w("el violín", "the violin"), w("la trompeta", "the trumpet"), w("el tambor", "the drum"), w("la flauta", "the flute"), w("el músico", "the musician")],
        sentences: [
          s("el piano y el violín", "the piano and the violin", ["el piano", "y", "el violín", "la trompeta"], ["el piano", "el violín"]),
          s("la trompeta y el tambor", "the trumpet and the drum", ["la trompeta", "y", "el tambor", "la flauta"], ["la trompeta", "el tambor"]),
          s("el músico y la flauta", "the musician and the flute", ["el músico", "y", "la flauta", "el piano"], ["el músico", "la flauta"]),
        ],
      },
      {
        title: "Theater & Shows",
        description: "Stages, audiences, applause, roles",
        words: [w("el teatro", "the theater"), w("la obra", "the play (theater)"), w("el escenario", "the stage"), w("el público", "the audience"), w("el aplauso", "the applause"), w("el papel", "the role")],
        sentences: [
          s("el teatro y la obra", "the theater and the play", ["el teatro", "y", "la obra", "el escenario"], ["el teatro", "la obra"]),
          s("el público y el aplauso", "the audience and the applause", ["el público", "y", "el aplauso", "el papel"], ["el público", "el aplauso"]),
          s("el actor tiene el papel", "the actor has the role", ["el actor", "tiene", "el papel", "el escenario"], ["el actor", "el papel"]),
        ],
      },
      {
        title: "Media & Press",
        description: "Magazines, articles, covers, editors",
        words: [w("la revista", "the magazine"), w("el artículo", "the article"), w("la portada", "the cover"), w("el editor", "the editor"), w("la columna", "the column"), w("la publicidad", "the advertising")],
        sentences: [
          s("la revista y el artículo", "the magazine and the article", ["la revista", "y", "el artículo", "la portada"], ["la revista", "el artículo"]),
          s("la portada y la columna", "the cover and the column", ["la portada", "y", "la columna", "el editor"], ["la portada", "la columna"]),
          s("el editor y la publicidad", "the editor and the advertising", ["el editor", "y", "la publicidad", "la revista"], ["el editor", "la publicidad"]),
        ],
      },
      {
        title: "Ancient Worlds",
        description: "Pyramids, empires, temples, warriors",
        words: [w("la pirámide", "the pyramid"), w("el imperio", "the empire"), w("la ruina", "the ruin"), w("el templo", "the temple"), w("el guerrero", "the warrior"), w("la civilización", "the civilization")],
        sentences: [
          s("la pirámide y el templo", "the pyramid and the temple", ["la pirámide", "y", "el templo", "la ruina"], ["la pirámide", "el templo"]),
          s("el imperio y la civilización", "the empire and the civilization", ["el imperio", "y", "la civilización", "el guerrero"], ["el imperio", "la civilización"]),
          s("el guerrero es antiguo", "the warrior is ancient", ["el guerrero", "es", "antiguo", "la ruina"], ["el guerrero", "antiguo"]),
        ],
      },
      {
        title: "Environment II",
        description: "Pollution, jungles, droughts, floods",
        words: [w("la contaminación", "the pollution"), w("el reciclaje", "the recycling"), w("la selva", "the jungle"), w("el petróleo", "the petroleum"), w("la sequía", "the drought"), w("la inundación", "the flood")],
        sentences: [
          s("la contaminación y el petróleo", "the pollution and the petroleum", ["la contaminación", "y", "el petróleo", "el reciclaje"], ["la contaminación", "el petróleo"]),
          s("la selva es verde", "the jungle is green", ["la selva", "es", "verde", "la sequía"], ["la selva", "verde"]),
          s("la sequía y la inundación", "the drought and the flood", ["la sequía", "y", "la inundación", "el reciclaje"], ["la sequía", "la inundación"]),
        ],
      },
    ],
  },
  // ==================== L2 · MASTERY ====================
  {
    id: "section-l2-8",
    title: "Mastery — Level 2",
    description: "Nuanced emotion, business, technology, and philosophy",
    units: [
      {
        title: "Nuanced Emotions",
        description: "Nostalgia, relief, envy, amazement",
        words: [w("la nostalgia", "the nostalgia"), w("la vergüenza", "the embarrassment"), w("el alivio", "the relief"), w("la envidia", "the envy"), w("la ternura", "the tenderness"), w("el asombro", "the amazement")],
        sentences: [
          s("la nostalgia y la ternura", "the nostalgia and the tenderness", ["la nostalgia", "y", "la ternura", "el alivio"], ["la nostalgia", "la ternura"]),
          s("la vergüenza y el alivio", "the embarrassment and the relief", ["la vergüenza", "y", "el alivio", "la envidia"], ["la vergüenza", "el alivio"]),
          s("la envidia y el asombro", "the envy and the amazement", ["la envidia", "y", "el asombro", "la nostalgia"], ["la envidia", "el asombro"]),
        ],
      },
      {
        title: "Business",
        description: "Profits, losses, contracts, partners",
        words: [w("el negocio", "the business"), w("la ganancia", "the profit"), w("la pérdida", "the loss"), w("el contrato", "the contract"), w("la inversión", "the investment"), w("el socio", "the partner")],
        sentences: [
          s("el negocio y la ganancia", "the business and the profit", ["el negocio", "y", "la ganancia", "la pérdida"], ["el negocio", "la ganancia"]),
          s("el contrato y el socio", "the contract and the partner", ["el contrato", "y", "el socio", "la inversión"], ["el contrato", "el socio"]),
          s("la inversión y la pérdida", "the investment and the loss", ["la inversión", "y", "la pérdida", "la ganancia"], ["la inversión", "la pérdida"]),
        ],
      },
      {
        title: "Technology",
        description: "Robots, apps, batteries, signals",
        words: [w("la tecnología", "the technology"), w("el robot", "the robot"), w("la aplicación", "the app"), w("la batería", "the battery"), w("la señal", "the signal"), w("el cargador", "the charger")],
        sentences: [
          s("la tecnología y el robot", "the technology and the robot", ["la tecnología", "y", "el robot", "la aplicación"], ["la tecnología", "el robot"]),
          s("la batería y el cargador", "the battery and the charger", ["la batería", "y", "el cargador", "la señal"], ["la batería", "el cargador"]),
          s("yo necesito la señal", "I need the signal", ["yo necesito", "la señal", "la aplicación", "el cargador"], ["yo necesito", "la señal"]),
        ],
      },
      {
        title: "Politics",
        description: "Votes, elections, candidates, citizens",
        words: [w("la política", "the politics"), w("el voto", "the vote"), w("la elección", "the election"), w("el candidato", "the candidate"), w("el ciudadano", "the citizen"), w("la campaña", "the campaign")],
        sentences: [
          s("el voto y la elección", "the vote and the election", ["el voto", "y", "la elección", "la política"], ["el voto", "la elección"]),
          s("el candidato y la campaña", "the candidate and the campaign", ["el candidato", "y", "la campaña", "el ciudadano"], ["el candidato", "la campaña"]),
          s("el ciudadano tiene el derecho", "the citizen has the right", ["el ciudadano", "tiene", "el derecho", "el voto"], ["el ciudadano", "el derecho"]),
        ],
      },
      {
        title: "Philosophy",
        description: "Existence, ethics, purpose, reality",
        words: [w("la filosofía", "the philosophy"), w("la existencia", "the existence"), w("la conciencia", "the conscience"), w("la ética", "the ethics"), w("el propósito", "the purpose"), w("la realidad", "the reality")],
        sentences: [
          s("la filosofía y la ética", "the philosophy and the ethics", ["la filosofía", "y", "la ética", "la existencia"], ["la filosofía", "la ética"]),
          s("la existencia y la realidad", "the existence and the reality", ["la existencia", "y", "la realidad", "la conciencia"], ["la existencia", "la realidad"]),
          s("el propósito es profundo", "the purpose is deep", ["el propósito", "es", "profundo", "la conciencia"], ["el propósito", "profundo"]),
        ],
      },
      {
        title: "Literature",
        description: "Metaphors, symbols, verses, plots",
        words: [w("la metáfora", "the metaphor"), w("el símbolo", "the symbol"), w("el verso", "the verse"), w("la rima", "the rhyme"), w("el párrafo", "the paragraph"), w("la trama", "the plot")],
        sentences: [
          s("la metáfora y el símbolo", "the metaphor and the symbol", ["la metáfora", "y", "el símbolo", "el verso"], ["la metáfora", "el símbolo"]),
          s("el verso y la rima", "the verse and the rhyme", ["el verso", "y", "la rima", "el párrafo"], ["el verso", "la rima"]),
          s("la trama es interesante", "the plot is interesting", ["la trama", "es", "interesante", "la metáfora"], ["la trama", "interesante"]),
        ],
      },
      {
        title: "Everyday Idioms",
        description: "From time to time, right away, suddenly",
        words: [w("de vez en cuando", "from time to time"), w("en seguida", "right away"), w("a menudo", "often"), w("de repente", "suddenly"), w("por fin", "finally"), w("a veces", "sometimes")],
        sentences: [
          s("de vez en cuando yo leo", "from time to time I read", ["de vez en cuando", "yo leo", "a menudo", "por fin"], ["de vez en cuando", "yo leo"]),
          s("a veces yo trabajo tarde", "sometimes I work late", ["a veces", "yo trabajo", "tarde", "de repente"], ["a veces", "yo trabajo", "tarde"]),
          s("por fin yo estoy bien", "finally I am well", ["por fin", "yo estoy", "bien", "en seguida"], ["por fin", "yo estoy", "bien"]),
        ],
      },
      {
        title: "Farewell & Beyond",
        description: "Beginnings, destiny, gratitude",
        words: [w("el comienzo", "the start"), w("el destino", "the destiny"), w("el orgullo", "the pride"), w("la gratitud", "the gratitude"), w("inolvidable", "unforgettable"), w("la jornada", "the journey")],
        sentences: [
          s("el comienzo y el destino", "the start and the destiny", ["el comienzo", "y", "el destino", "el orgullo"], ["el comienzo", "el destino"]),
          s("la jornada es inolvidable", "the journey is unforgettable", ["la jornada", "es", "inolvidable", "la gratitud"], ["la jornada", "inolvidable"]),
          s("el orgullo y la gratitud", "the pride and the gratitude", ["el orgullo", "y", "la gratitud", "el destino"], ["el orgullo", "la gratitud"]),
        ],
      },
    ],
  },
  // ==================== L2 · VERB CONJUGATION ====================
  {
    id: "section-l2-9",
    title: "Verb Conjugation — Level 2",
    description: "Stem-changers and more key irregulars, person by person",
    units: [
      {
        title: "Stem-Changer: Querer",
        description: "To want — quiero, quieres, quiere…",
        words: [w("yo quiero", "I want"), w("tú quieres", "you want"), w("él quiere", "he wants"), w("nosotros queremos", "we want"), w("ustedes quieren", "you all want"), w("ellos quieren", "they want")],
        sentences: [
          s("yo quiero y tú quieres", "I want and you want", ["yo quiero", "y", "tú quieres", "él quiere"], ["yo quiero", "tú quieres"]),
          s("nosotros queremos más", "we want more", ["nosotros queremos", "más", "ustedes quieren", "ellos quieren"], ["nosotros queremos", "más"]),
          s("ellos quieren el pan", "they want the bread", ["ellos quieren", "el pan", "yo quiero", "él quiere"], ["ellos quieren", "el pan"]),
        ],
      },
      {
        title: "Stem-Changer: Poder",
        description: "To be able — puedo, puedes, puede…",
        words: [w("yo puedo", "I can"), w("tú puedes", "you can"), w("él puede", "he can"), w("nosotros podemos", "we can"), w("ustedes pueden", "you all can"), w("ellos pueden", "they can")],
        sentences: [
          s("yo puedo y tú puedes", "I can and you can", ["yo puedo", "y", "tú puedes", "él puede"], ["yo puedo", "tú puedes"]),
          s("nosotros podemos hoy", "we can today", ["nosotros podemos", "hoy", "ustedes pueden", "mañana"], ["nosotros podemos", "hoy"]),
          s("ellos pueden mañana", "they can tomorrow", ["ellos pueden", "mañana", "yo puedo", "él puede"], ["ellos pueden", "mañana"]),
        ],
      },
      {
        title: "Irregular: Hacer",
        description: "To make — hago, haces, hace…",
        words: [w("yo hago", "I make"), w("tú haces", "you make"), w("él hace", "he makes"), w("nosotros hacemos", "we make"), w("ustedes hacen", "you all make"), w("ellos hacen", "they make")],
        sentences: [
          s("yo hago la cena", "I make the dinner", ["yo hago", "la cena", "tú haces", "él hace"], ["yo hago", "la cena"]),
          s("nosotros hacemos el pan", "we make the bread", ["nosotros hacemos", "el pan", "ustedes hacen", "ellos hacen"], ["nosotros hacemos", "el pan"]),
          s("ellos hacen mucho", "they make a lot", ["ellos hacen", "mucho", "yo hago", "él hace"], ["ellos hacen", "mucho"]),
        ],
      },
      {
        title: "Irregular: Ver",
        description: "To see — veo, ves, ve…",
        words: [w("yo veo", "I see"), w("tú ves", "you see"), w("él ve", "he sees"), w("nosotros vemos", "we see"), w("ustedes ven", "you all see"), w("ellos ven", "they see")],
        sentences: [
          s("yo veo y tú ves", "I see and you see", ["yo veo", "y", "tú ves", "él ve"], ["yo veo", "tú ves"]),
          s("nosotros vemos el mar", "we see the sea", ["nosotros vemos", "el mar", "ustedes ven", "ellos ven"], ["nosotros vemos", "el mar"]),
          s("ellos ven la película", "they see the movie", ["ellos ven", "la película", "yo veo", "él ve"], ["ellos ven", "la película"]),
        ],
      },
      {
        title: "Irregular: Decir",
        description: "To say — digo, dices, dice…",
        words: [w("yo digo", "I say"), w("tú dices", "you say"), w("él dice", "he says"), w("nosotros decimos", "we say"), w("ustedes dicen", "you all say"), w("ellos dicen", "they say")],
        sentences: [
          s("yo digo la verdad", "I say the truth", ["yo digo", "la verdad", "tú dices", "él dice"], ["yo digo", "la verdad"]),
          s("nosotros decimos hola", "we say hello", ["nosotros decimos", "hola", "ustedes dicen", "adiós"], ["nosotros decimos", "hola"]),
          s("ellos dicen adiós", "they say goodbye", ["ellos dicen", "adiós", "yo digo", "él dice"], ["ellos dicen", "adiós"]),
        ],
      },
      {
        title: "Irregular: Venir",
        description: "To come — vengo, vienes, viene…",
        words: [w("yo vengo", "I come"), w("tú vienes", "you come"), w("él viene", "he comes"), w("nosotros venimos", "we come"), w("ustedes vienen", "you all come"), w("ellos vienen", "they come")],
        sentences: [
          s("yo vengo hoy", "I come today", ["yo vengo", "hoy", "tú vienes", "él viene"], ["yo vengo", "hoy"]),
          s("nosotros venimos a la fiesta", "we come to the party", ["nosotros venimos", "a", "la fiesta", "ustedes vienen"], ["nosotros venimos", "la fiesta"]),
          s("ellos vienen mañana", "they come tomorrow", ["ellos vienen", "mañana", "yo vengo", "él viene"], ["ellos vienen", "mañana"]),
        ],
      },
      {
        title: "Irregular: Salir",
        description: "To go out — salgo, sales, sale…",
        words: [w("yo salgo", "I go out"), w("tú sales", "you go out"), w("él sale", "he goes out"), w("nosotros salimos", "we go out"), w("ustedes salen", "you all go out"), w("ellos salen", "they go out")],
        sentences: [
          s("yo salgo de la casa", "I go out of the house", ["yo salgo", "de", "la casa", "tú sales"], ["yo salgo", "la casa"]),
          s("nosotros salimos juntos", "we go out together", ["nosotros salimos", "juntos", "ustedes salen", "ellos salen"], ["nosotros salimos", "juntos"]),
          s("ellos salen de la escuela", "they go out of the school", ["ellos salen", "de", "la escuela", "él sale"], ["ellos salen", "la escuela"]),
        ],
      },
      {
        title: "Irregular: Dar",
        description: "To give — doy, das, da…",
        words: [w("yo doy", "I give"), w("tú das", "you give"), w("él da", "he gives"), w("nosotros damos", "we give"), w("ustedes dan", "you all give"), w("ellos dan", "they give")],
        sentences: [
          s("yo doy las gracias", "I give the thanks", ["yo doy", "las", "gracias", "tú das"], ["yo doy", "gracias"]),
          s("nosotros damos el regalo", "we give the gift", ["nosotros damos", "el regalo", "ustedes dan", "ellos dan"], ["nosotros damos"]),
          s("ellos dan mucho", "they give a lot", ["ellos dan", "mucho", "yo doy", "él da"], ["ellos dan", "mucho"]),
        ],
      },
    ],
  },
  // ==================== L2 · GRAMMAR ====================
  {
    id: "section-l2-10",
    title: "Grammar — Level 2",
    description: "Demonstratives, reflexives, adverbs, and connectors",
    units: [
      {
        title: "Demonstratives",
        description: "This, that, these, those",
        words: [w("este", "this (masculine)"), w("esta", "this (feminine)"), w("ese", "that (masculine)"), w("esa", "that (feminine)"), w("estos", "these"), w("esos", "those")],
        sentences: [
          s("este perro y ese gato", "this dog and that cat", ["este", "perro", "y", "ese", "gato"], ["este", "ese"]),
          s("esta casa es nueva", "this house is new", ["esta", "casa", "es", "nueva", "esa"], ["esta", "la casa", "nueva"]),
          s("estos libros y esos", "these books and those", ["estos", "libros", "y", "esos", "esta"], ["estos", "esos"]),
        ],
      },
      {
        title: "Reflexives",
        description: "I feel, I stay, I laugh",
        words: [w("me siento", "I feel"), w("me acuesto", "I go to bed"), w("me despido", "I say goodbye"), w("me río", "I laugh"), w("me quedo", "I stay"), w("me olvido", "I forget")],
        sentences: [
          s("me siento bien", "I feel well", ["me siento", "bien", "mal", "me quedo"], ["me siento", "bien"]),
          s("me acuesto tarde", "I go to bed late", ["me acuesto", "tarde", "temprano", "me olvido"], ["me acuesto", "tarde"]),
          s("me quedo en la casa", "I stay in the house", ["me quedo", "en", "la casa", "me despido"], ["me quedo", "la casa"]),
        ],
      },
      {
        title: "Por & Para",
        description: "That is why, for example, forever",
        words: [w("por eso", "that is why"), w("para mí", "for me"), w("por ejemplo", "for example"), w("para siempre", "forever"), w("por ahora", "for now"), w("para ti", "for you")],
        sentences: [
          s("por eso yo estudio", "that is why I study", ["por eso", "yo estudio", "por ejemplo", "para mí"], ["por eso", "yo estudio"]),
          s("el café es para mí", "the coffee is for me", ["el café", "es", "para mí", "para ti"], ["el café", "para mí"]),
          s("amigos para siempre", "friends forever", ["amigos", "para siempre", "por ahora", "por eso"], ["para siempre", "los amigos"]),
        ],
      },
      {
        title: "Adverbs",
        description: "Quickly, slowly, easily, always",
        words: [w("rápidamente", "quickly"), w("lentamente", "slowly"), w("fácilmente", "easily"), w("felizmente", "happily"), w("siempre", "always"), w("casi", "almost")],
        sentences: [
          s("yo corro rápidamente", "I run quickly", ["yo corro", "rápidamente", "lentamente", "casi"], ["yo corro", "rápidamente"]),
          s("yo leo lentamente", "I read slowly", ["yo leo", "lentamente", "fácilmente", "siempre"], ["yo leo", "lentamente"]),
          s("yo siempre gano fácilmente", "I always win easily", ["yo", "siempre", "gano", "fácilmente", "casi"], ["siempre", "yo gano", "fácilmente"]),
        ],
      },
      {
        title: "Conjunctions",
        description: "But, because, although, while, if, or",
        words: [w("pero", "but"), w("porque", "because"), w("aunque", "although"), w("mientras", "while"), w("si", "if"), w("o", "or")],
        sentences: [
          s("yo quiero pero no puedo", "I want but I cannot", ["yo quiero", "pero", "no", "puedo", "porque"], ["pero", "yo quiero", "no"]),
          s("yo como porque yo trabajo", "I eat because I work", ["yo como", "porque", "yo trabajo", "aunque"], ["porque", "yo como", "yo trabajo"]),
          s("café o té", "coffee or tea", ["café", "o", "té", "si"], ["o", "el café", "el té"]),
        ],
      },
      {
        title: "Ordinals",
        description: "First, second, third, last",
        words: [w("primero", "first"), w("segundo", "second (ordinal)"), w("tercero", "third"), w("cuarto", "fourth"), w("quinto", "fifth"), w("último", "last (final)")],
        sentences: [
          s("primero y segundo", "first and second", ["primero", "y", "segundo", "tercero"], ["primero", "segundo"]),
          s("el tercero y el cuarto", "the third and the fourth", ["el", "tercero", "y", "cuarto", "quinto"], ["tercero", "cuarto"]),
          s("el último capítulo", "the last chapter", ["el", "último", "capítulo", "primero"], ["último", "el capítulo"]),
        ],
      },
      {
        title: "Exclamations",
        description: "How great! Watch out! Let's go!",
        words: [w("¡qué bueno!", "how great!"), w("¡ojalá!", "hopefully!"), w("¡cuidado!", "watch out!"), w("¡ay!", "ouch!"), w("¡vamos!", "let's go!"), w("¡genial!", "awesome!")],
        sentences: [
          s("qué bueno amigo", "how great friend", ["qué bueno", "amigo", "genial", "ojalá"], ["¡qué bueno!", "el amigo"]),
          s("cuidado con el perro", "watch out for the dog", ["cuidado", "con", "el perro", "ay"], ["¡cuidado!", "el perro"]),
          s("vamos a la playa", "let's go to the beach", ["vamos", "a", "la playa", "genial"], ["¡vamos!", "la playa"]),
        ],
      },
      {
        title: "Question Practice",
        description: "Putting question words to work",
        words: [w("¿cuál?", "which?"), w("¿cuánto?", "how much?"), w("¿cuántos?", "how many?"), w("la encuesta", "the survey"), w("el cuestionario", "the questionnaire"), w("la explicación", "the explanation")],
        sentences: [
          s("cuál es tu nombre", "which is your name", ["cuál", "es", "tu", "nombre", "cuánto"], ["¿cuál?", "el nombre", "tu"]),
          s("cuánto es la cuenta", "how much is the bill", ["cuánto", "es", "la cuenta", "cuántos"], ["¿cuánto?", "la cuenta"]),
          s("cuántos amigos tienes", "how many friends do you have", ["cuántos", "amigos", "tienes", "cuál"], ["¿cuántos?", "los amigos"]),
        ],
      },
    ],
  },
];
