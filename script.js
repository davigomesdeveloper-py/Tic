const canvas = document.getElementById("dotsCanvas");
        const ctx = canvas.getContext("2d");

        let width;
        let height;
        let dots = [];

        /*
         * CONFIGURAÇÕES PRINCIPAIS
         */
        const CONFIG = {

            // Distância entre os pontos
            spacing: 6,

            // Tamanho dos pontos
            radius: 2.0,

            // Quantidade de pontos que podem aparecer
            density: 0.55,

            // Opacidade máxima
            maxOpacity: 1.15,

            // Duração aproximada de cada ciclo
            cycle: 26000,

            // Quantidade de grupos
            groups: 55,

            // Tamanho dos grupos
            groupSizeMin: 20,
            groupSizeMax: 85,

            // Velocidade da animação
            speed: 2
        };


        /*
         * FUNÇÃO PARA REDIMENSIONAR O CANVAS
         */
        function resizeCanvas() {

            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;

            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            ctx.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );

            createDots();
        }


        /*
         * CRIA OS GRUPOS DE PONTOS
         */
        function createDots() {

            dots = [];

            const cols = Math.ceil(width / CONFIG.spacing);
            const rows = Math.ceil(height / CONFIG.spacing);


            /*
             * Criamos centros espalhados pela tela.
             * Cada centro será responsável por uma "mancha"
             * de pontos.
             */

            const groups = [];

            for (let i = 0; i < CONFIG.groups; i++) {

                groups.push({

                    x: Math.random() * width,

                    y: Math.random() * height,

                    radius:
                        CONFIG.groupSizeMin +
                        Math.random() *
                        (CONFIG.groupSizeMax - CONFIG.groupSizeMin),

                    strength:
                        0.7 +
                        Math.random() * 0.3,

                    phase:
                        Math.random() *
                        Math.PI *
                        2,

                    speed:
                        0.7 +
                        Math.random() * 0.8
                });
            }


            /*
             * Percorremos a grade.
             */
            for (let row = 0; row < rows; row++) {

                for (let col = 0; col < cols; col++) {

                    const x = col * CONFIG.spacing;
                    const y = row * CONFIG.spacing;


                    /*
                     * Pequena chance de o ponto nem existir.
                     * Isso ajuda a deixar o desenho irregular.
                     */
                    if (Math.random() > CONFIG.density) {
                        continue;
                    }


                    let influence = 0;
                    let closestGroup = null;
                    let closestDistance = Infinity;


                    /*
                     * Calcula a influência dos grupos próximos.
                     */
                    for (const group of groups) {

                        const dx = x - group.x;
                        const dy = y - group.y;

                        const distance =
                            Math.sqrt(dx * dx + dy * dy);

                        if (distance < closestDistance) {

                            closestDistance = distance;
                            closestGroup = group;
                        }

                        /*
                         * Área de influência.
                         */
                        const normalized =
                            distance / group.radius;

                        if (normalized < 1) {

                            const effect =
                                1 - normalized;

                            influence +=
                                effect * effect;
                        }
                    }


                    /*
                     * Só criamos pontos onde existe influência.
                     */
                    if (influence < 0.12) {
                        continue;
                    }


                    /*
                     * Limita a influência.
                     */
                    influence =
                        Math.min(influence, 1);


                    dots.push({

                        x: x,

                        y: y,

                        influence: influence,

                        phase:
                            Math.random() *
                            Math.PI * 2,

                        speed:
                            0.7 +
                            Math.random() * 0.7,

                        size:
                            CONFIG.radius *
                            (
                                0.75 +
                                Math.random() * 0.45
                            ),

                        /*
                         * Alguns pontos serão cinza claro,
                         * outros mais escuros.
                         */
                        brightness:
                            0.45 +
                            Math.random() * 0.55
                    });
                }
            }
        }


        /*
         * FUNÇÃO DE INTERPOLAÇÃO SUAVE
         */
        function smoothstep(t) {

            return t * t * (3 - 2 * t);
        }


        /*
         * ANIMAÇÃO
         */
        function animate(time) {

            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            /*
             * Tempo contínuo.
             */
            const seconds =
                time * 0.001 * CONFIG.speed;


            for (const dot of dots) {

                /*
                 * O ponto pulsa lentamente.
                 */
                const wave =
                    Math.sin(
                        seconds * dot.speed * 0.65 +
                        dot.phase
                    );


                /*
                 * Converte de -1/+1 para 0/1.
                 */
                let visibility =
                    (wave + 1) / 2;


                /*
                 * Suaviza o aparecimento/desaparecimento.
                 */
                visibility =
                    smoothstep(visibility);


                /*
                 * Pontos nas bordas dos grupos
                 * ficam mais discretos.
                 */
                const opacity =
                    visibility *
                    dot.influence *
                    CONFIG.maxOpacity *
                    dot.brightness;


                /*
                 * Não desenha pontos praticamente invisíveis.
                 */
                if (opacity < 0.015) {
                    continue;
                }


                ctx.beginPath();

                ctx.arc(
                    dot.x,
                    dot.y,
                    dot.size,
                    0,
                    Math.PI * 2
                );


                /*
                 * Preto com transparência.
                 *
                 * Você pode trocar para outra cor.
                 */
                ctx.fillStyle =
                    `rgba(20, 20, 20, ${opacity})`;

                ctx.fill();
            }


            requestAnimationFrame(animate);
        }


        /*
         * INICIALIZA
         */
        window.addEventListener(
            "resize",
            resizeCanvas
        );

        resizeCanvas();

        requestAnimationFrame(animate);