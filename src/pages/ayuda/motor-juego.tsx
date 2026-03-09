//
import React from "react";

const MotorJuego = () => {
    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">Motor de juego</h1>
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4">MOTOR DE JUEGO</h2>
                    <p className="text-gray-700 whitespace-pre-line">
                        El motor de juego está basado sobre 5 zonas especificadas pero no visibles en el visor de partidos (ultradefensiva, defensiva, media, ofensiva, finalización) y actuará sobre la valoración de las habilidades de los jugadores (individualmente) que rodean el balón, según la zona donde esté y las órdenes que cada manager dé a esos jugadores en dicha zona desde un editor de alineaciones, antes de su comienzo, que será programable en el directo, dando nuevas órdenes al motor de juego durante el partido...
                    </p>
                    <hr className="my-6" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">EJEMPLOS DE ACTUACIÓN DEL MOTOR DE JUEGO EN EL VISOR DE PARTIDOS:</h3>
                    <hr className="my-4" />
                    <div className="text-gray-700 mb-6">
                        <div className="mb-2">
                            <strong>11 jugadores con alineación clásica 1-4-4-2 <span className="font-normal">(EQUIPO LOCAL)</span></strong>
                            <ul className="list-disc ml-6">
                                <li>1-Portero</li>
                                <li>2-Defensas centrales</li>
                                <li>2-Defensas laterales</li>
                                <li>4-Mediocampistas</li>
                                <li>2-Delanteros</li>
                            </ul>
                        </div>
                        <div className="mb-2">
                            <strong>11 jugadores con alineación clásica 1-4-4-2 <span className="font-normal">(EQUIPO VISITANTE)</span></strong>
                            <ul className="list-disc ml-6">
                                <li>1-Portero</li>
                                <li>2-Defensas centrales</li>
                                <li>2-Defensas laterales</li>
                                <li>4-Mediocampistas</li>
                                <li>2-Delanteros</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">EJEMPLOS DE JUGADAS</h3>
                    <div className="text-gray-700 whitespace-pre-line">
                        <strong>¡Teniendo en cuenta que estos juegos se basan siempre en probabilidades!</strong>

                        <div>-Aquí el motor hace que el juego se cree según la zona donde esté el balón/orden dada por los managers y habilidades de jugadores...</div>
                        <div>-Ejemplo de cómo genera las jugadas</div>

                        <div className="mt-4"><strong>Zona Ultradefensiva del atacante <span className="font-normal">(poseedor del balón)</span> o finalización del rival:</strong></div>
                        <div><strong>Saque de portería:</strong></div>
                        <div className="ml-4">-El portero saca de portería, su nivel de pases es lo primero que se mira en el motor, dependiendo de su nivel de pases y del nivel de control de balón de los receptores, acabará recibiendo el balón su compañero de equipo o su rival según quien tenga más nivel de habilidad en <strong>"control de balón"</strong>, normalmente cuando saca el portero siempre llega el balón al mediocampo, a no ser que tenga otra orden, o muy poca habilidad en <strong>"resistencia"</strong> y contra más valoración de pases tenga el portero, más aumenta la posibilidad del control de su compañero y viceversa si tiene pocos pases, dirigiéndose el balón a una zona muerta, donde ya dependerá de la velocidad del jugador más cercano al balón o que llegue antes hacia él...</div>

                        <div className="mt-4"><strong>Zona "defensiva" atacante <span className="font-normal">(poseedor del balón)</span> u "ofensiva" del rival:</strong></div>
                        <div className="ml-4">-Suponiendo que el balón llega a la zona defensiva, los dos jugadores más cercanos a ese balón (defensa atacante y jugador rival más cercano, generalmente un delantero), ambos serán los que luchen por recepcionarlo (En circunstancia normal el jugador con más nivel de control de balón recibirá el balón), suponiendo que lo reciba el defensa atacante, el motor de juego de nuevo valora varias opciones...</div>
                        <div className="ml-4">-Pasar el balón directamente o regatear hacia adelante con el balón, (según la orden dada por el manager antes del comienzo del partido y en esa zona para esos jugadores...</div>

                        <div className="ml-8">*Si tiene orden de pasar el balón se repite la misma acción que el portero, el jugador con mejor control de balón recogerá el balón y de nuevo el motor de juego hará la valoración de si su nivel de pases aumenta o disminuye sobre si su compañero será el receptor o su rival, exceptuando un mal pase al hueco, que lo recepcionará el jugador que antes llegue hacia el balón (velocidad).</div>

                        <div className="ml-8">*Si tiene orden de regatear el motor de juego comparará el nivel de regate del defensa atacante contra el nivel de defensa del rival que esté más próximo a él, que generalmente es un mediocampista rival y no tienen suficiente defensa como para robarle el balón, aunque esto es cuestión de probabilidades [regate del defensa atacante=95/Defensa del mediocampista rival=60], en este caso volvemos a tomar los porcentajes de cada uno para ver quién sigue con el balón, (porcentaje de seguir con el balón el defensa atacante 70%/mediocampista rival 30% aprox...</div>

                        <div className="mt-4"><strong>Zona Media atacante <span className="font-normal">(poseedor del balón)</span> o Media del rival:</strong></div>
                        <div className="ml-4">-El mediocampista atacante llega a la zona ofensiva y vuelve a tomar otra decisión que ya le ordenó anteriormente el manager en el editor de partidos al cruzar dicha zona...</div>

                        <div className="ml-8">*Si la decisión es continuar con el balón, el motor vuelve a calcular entre su regate y la defensa, en este caso del mediocampista rival que esté más cercano a él...[mediocampista atacante regate=95/defensa del mediocampista rival=95], en este caso el motor de juego vuelve a calcular el porcentaje de cada uno (mediocampista atacante 50%/mediocampista rival 50%)...</div>

                        <div className="mt-4"><strong>Zona Ofensiva atacante <span className="font-normal">(poseedor del balón)</span> o defensiva del rival:</strong></div>
                        <div className="ml-4">Supongamos que el manager le dio la orden de pasar el balón a los delanteros, el motor vuelve a calcular de nuevo si el delantero con 85 en control de balón o el defensor con 95 en control de balón recepcionan el balón y suponiendo que el porcentaje le da el balón al delantero el motor de juego vuelve a calcular sobre regate contra defensa [delantero 45%/defensor 55%], a pesar de tener más porcentaje el defensor, supongamos que el motor se lo da al delantero porque el pase de su compañero tiene una valoración de 100 y aumenta su porcentaje de control de balón y este de nuevo tiene una orden dada por el manager de regatear o disparar a portería...</div>

                        <div className="mt-4"><strong>Zona Finalización atacante <span className="font-normal">(poseedor del balón)</span> o ultra defensiva del rival:</strong></div>
                        <div className="ml-4">En el caso de regatear, el motor de juego vuelve a calcular entre el regate del delantero y la defensa del defensor rival, suponiendo que el porcentaje le da el balón al atacante...</div>

                        <div className="ml-4">Si la decisión del manager ha sido lanzar a portería, ya llegaríamos a la fase final del motor calculando de nuevo entre el nivel de finalización del delantero y el de portería del portero rival. (la aleatoriedad sobre el porcentaje de nuevo decidirá si es gol o parada del portero <strong>(habiendo varias opciones de jugada= (parada del portero)</strong>, como lanzamiento fuera, balón al poste, falta al portero, etc...</div>

                        <div className="mt-4"><strong>P.D.-ENTRE TODOS ESTOS CÁLCULOS, SIEMPRE ESTÁ POR MEDIO TAMBIÉN EL NIVEL DE LOS JUGADORES DE VELOCIDAD QUE HACE QUE A VECES, AUNQUE EL CONTRARIO TENGA MÁS OPCIONES DE LLEVARSE EL BALÓN, SI ESTE PRIMERO TIENE MUCHA MÁS VELOCIDAD QUE EL RIVAL Y ESTÁ MÁS CERCA, NO DEJARÁ QUE EL RIVAL LLEGUE Y DE ESTA FORMA ROMPE LA DECISIÓN DEL MOTOR DE TOMAR UN PORCENTAJE LLEVÁNDOSE EL BALÓN.</strong></div>
                    </div>
                </div>

                {/* Bloque de habilidades de jugadores */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500 mt-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">JUGADORES<span className="font-normal">(HABILIDADES)</span></h2>
                    <div className="text-gray-700">
                        <strong>HABILIDADES DE LOS JUGADORES POR ORDEN DE INFLUENCIA</strong>
                        <br />
                        <span className="block mt-4 mb-2 font-bold">HABILIDADES TÉCNICAS:</span>
                        {/* ...contenido de habilidades... */}
                    </div>
                </div>
            </div>
            {/* Bloque de Finanzas completamente fuera del bloque de habilidades */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-yellow-500 mt-8">
                <h2 className="text-2xl font-semibold text-yellow-700 mb-4">FINANZAS</h2>
                <div className="text-gray-700">
                    <strong className="block mb-2">FINANZAS</strong>
                    <span className="block font-bold mt-4 mb-2">ECONOMÍA:</span>
                    {/* ...contenido de finanzas... */}
                </div>
            </div>
        </div>
    );
};

export default MotorJuego;
