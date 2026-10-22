// Biblioteca de exercícios em português.
// Fotos: Free Exercise DB (domínio público, licença Unlicense) — github.com/yuhonas/free-exercise-db.
// `image` é a pasta do exercício lá; cada uma tem 0.jpg (início) e 1.jpg (fim do movimento).
// `cautions`: articulações mais exigidas; o gerador de treino evita quando a pessoa tem restrição.
// `level`: 1 iniciante, 2 intermediário, 3 avançado. `unit`: "reps" (repetições) ou "seg" (segundos).

const strength = (group, equipment, level, cautions, image, name, id, steps, tip, unit = "reps") => ({
  id, name, group, equipment, type: "forca", level, cautions, unit, image, steps, tip,
});
const cardio = (group, equipment, level, cautions, image, name, id, steps, tip, unit = "seg") => ({
  id, name, group, equipment, type: "cardio", level, cautions, unit, image, steps, tip,
});
const stretch = (group, level, cautions, image, name, id, steps, tip) => ({
  id, name, group, equipment: "peso-corporal", type: "alongamento", level, cautions, unit: "seg", image, steps, tip,
});

export const EXERCISES = [
  // ---------- peito ----------
  strength("peito", "barra", 2, ["ombro"], "Barbell_Bench_Press_-_Medium_Grip", "Supino reto com barra", "supino-reto", [
    "Deite no banco com os pés firmes no chão e segure a barra um pouco mais aberta que os ombros.",
    "Desça a barra devagar até tocar de leve o meio do peito, com os cotovelos a uns 45° do corpo.",
    "Empurre a barra de volta até estender os braços, sem travar os cotovelos.",
  ], "Mantenha as escápulas juntas e o quadril no banco. Com carga alta, peça ajuda a alguém."),
  strength("peito", "halteres", 1, ["ombro"], "Dumbbell_Bench_Press", "Supino reto com halteres", "supino-halteres", [
    "Deite no banco com um halter em cada mão, na altura do peito, palmas para a frente.",
    "Empurre os halteres para cima até quase se encostarem.",
    "Desça devagar até os cotovelos ficarem um pouco abaixo da linha do banco.",
  ], "Os halteres deixam cada braço trabalhar sozinho: ótimo para corrigir desequilíbrios."),
  strength("peito", "halteres", 2, ["ombro"], "Incline_Dumbbell_Press", "Supino inclinado com halteres", "supino-inclinado-halteres", [
    "Ajuste o banco entre 30° e 45° e deite com um halter em cada mão, na altura do peito.",
    "Empurre os halteres para cima e um pouco para dentro, acima dos ombros.",
    "Desça controlando até sentir o alongamento na parte de cima do peito.",
  ], "Inclinação demais transfere o trabalho para os ombros; 30° costuma bastar."),
  strength("peito", "halteres", 2, ["ombro"], "Dumbbell_Flyes", "Crucifixo com halteres", "crucifixo-halteres", [
    "Deite no banco com os halteres acima do peito, palmas viradas uma para a outra.",
    "Com os cotovelos levemente dobrados, abra os braços em arco até a altura do peito.",
    "Feche os braços pelo mesmo arco, como se abraçasse uma árvore.",
  ], "Use carga leve: o ombro fica exposto na parte de baixo do movimento."),
  strength("peito", "peso-corporal", 1, ["punho", "ombro"], "Pushups", "Flexão de braço", "flexao", [
    "Apoie as mãos no chão um pouco mais abertas que os ombros, corpo reto da cabeça aos pés.",
    "Dobre os cotovelos e desça o peito até quase encostar no chão.",
    "Empurre o chão e volte, mantendo o abdômen firme.",
  ], "Está difícil? Apoie os joelhos no chão ou faça a versão com as mãos elevadas."),
  strength("peito", "peso-corporal", 1, ["punho"], "Incline_Push-Up", "Flexão inclinada (mãos elevadas)", "flexao-inclinada", [
    "Apoie as mãos num banco, mesa firme ou parede, corpo reto e inclinado.",
    "Dobre os cotovelos e leve o peito em direção ao apoio.",
    "Empurre de volta até estender os braços.",
  ], "Quanto mais alto o apoio, mais fácil. Ótima porta de entrada para a flexão no chão."),
  strength("peito", "polia", 2, ["ombro"], "Cable_Crossover", "Crossover na polia", "crossover", [
    "Fique no meio do aparelho com um pé à frente e segure as alças das polias altas.",
    "Com os cotovelos levemente dobrados, traga as mãos para a frente e para baixo até se cruzarem.",
    "Volte devagar até sentir o peito alongar.",
  ], "Pense em aproximar os cotovelos, não as mãos."),
  strength("peito", "maquina", 1, ["ombro"], "Butterfly", "Voador (peck deck)", "voador", [
    "Sente com as costas apoiadas e os antebraços ou mãos nas alavancas, na altura do peito.",
    "Feche os braços à frente, contraindo o peito.",
    "Volte devagar, sem deixar o peso bater.",
  ], "Ajuste o banco para que as mãos fiquem na altura do meio do peito."),

  // ---------- costas ----------
  strength("costas", "polia", 1, ["ombro"], "Wide-Grip_Lat_Pulldown", "Puxada frontal", "puxada-frontal", [
    "Sente com as coxas presas no apoio e segure a barra mais aberta que os ombros.",
    "Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo e para trás.",
    "Suba a barra devagar até estender os braços.",
  ], "Não jogue o tronco para trás: o movimento vem das costas, não do balanço."),
  strength("costas", "barra", 2, ["lombar"], "Bent_Over_Barbell_Row", "Remada curvada com barra", "remada-curvada", [
    "Segure a barra, dobre levemente os joelhos e incline o tronco à frente com a coluna reta.",
    "Puxe a barra em direção ao umbigo, juntando as escápulas.",
    "Desça a barra controlando, sem arredondar as costas.",
  ], "Se a lombar reclamar, troque pela remada unilateral com apoio no banco."),
  strength("costas", "halteres", 1, [], "One-Arm_Dumbbell_Row", "Remada unilateral com halter", "remada-unilateral", [
    "Apoie um joelho e a mão do mesmo lado no banco, coluna reta, halter na outra mão.",
    "Puxe o halter em direção ao quadril, cotovelo junto ao corpo.",
    "Desça devagar até estender o braço. Troque de lado.",
  ], "O apoio no banco protege a lombar — é uma ótima remada para começar."),
  strength("costas", "barra-fixa", 3, ["ombro"], "Pullups", "Barra fixa", "barra-fixa", [
    "Pendure-se na barra com as mãos mais abertas que os ombros, palmas para a frente.",
    "Puxe o corpo até o queixo passar a barra, levando os cotovelos para baixo.",
    "Desça devagar até estender os braços.",
  ], "Ainda não sai uma? Use elástico de assistência ou faça só a descida bem lenta."),
  strength("costas", "polia", 1, ["lombar"], "Seated_Cable_Rows", "Remada sentada na polia", "remada-sentada", [
    "Sente com os pés apoiados, joelhos levemente dobrados e coluna reta, segurando a alça.",
    "Puxe a alça em direção ao abdômen, juntando as escápulas.",
    "Estenda os braços devagar, sem curvar as costas para a frente.",
  ], "O tronco fica parado: só os braços e as escápulas se movem."),
  strength("costas", "barra", 2, [], "Inverted_Row", "Remada invertida", "remada-invertida", [
    "Com uma barra na altura da cintura, deite embaixo dela e segure com as mãos afastadas.",
    "Com o corpo reto e os calcanhares no chão, puxe o peito até a barra.",
    "Desça devagar até estender os braços.",
  ], "Quanto mais em pé o corpo, mais fácil. Dá para fazer em casa com uma mesa firme."),
  strength("costas", "peso-corporal", 1, ["lombar"], "Superman", "Superman", "superman", [
    "Deite de barriga para baixo com os braços estendidos à frente.",
    "Levante braços, peito e pernas do chão ao mesmo tempo e segure 2 segundos.",
    "Desça devagar e repita.",
  ], "Olhe para o chão para não forçar o pescoço."),
  strength("costas", "barra", 3, ["lombar", "joelho"], "Barbell_Deadlift", "Levantamento terra", "levantamento-terra", [
    "Com a barra sobre o meio dos pés, dobre quadril e joelhos e segure a barra com a coluna reta.",
    "Empurre o chão com os pés e suba estendendo quadril e joelhos juntos, barra rente às pernas.",
    "Desça a barra pelo mesmo caminho, mantendo as costas retas.",
  ], "Técnica antes de carga: aprenda com orientação de um profissional."),

  // ---------- ombros ----------
  strength("ombros", "halteres", 1, ["ombro"], "Dumbbell_Shoulder_Press", "Desenvolvimento com halteres", "desenvolvimento-halteres", [
    "Sente com as costas apoiadas e os halteres na altura dos ombros, palmas para a frente.",
    "Empurre os halteres para cima até quase estender os braços.",
    "Desça devagar até a altura das orelhas.",
  ], "Não arqueie a lombar: mantenha o abdômen firme."),
  strength("ombros", "halteres", 1, ["ombro"], "Side_Lateral_Raise", "Elevação lateral", "elevacao-lateral", [
    "Em pé, segure os halteres ao lado do corpo com os cotovelos levemente dobrados.",
    "Levante os braços pelos lados até a altura dos ombros.",
    "Desça devagar.",
  ], "Carga leve e sem balanço: o músculo é pequeno."),
  strength("ombros", "halteres", 1, ["ombro"], "Front_Dumbbell_Raise", "Elevação frontal", "elevacao-frontal", [
    "Em pé, segure os halteres à frente das coxas.",
    "Levante um ou os dois braços à frente até a altura dos ombros.",
    "Desça controlando.",
  ], "Mantenha o tronco parado — se precisar balançar, a carga está alta."),
  strength("ombros", "halteres", 2, ["lombar"], "Reverse_Flyes", "Crucifixo inverso", "crucifixo-inverso", [
    "Incline o tronco à frente com a coluna reta, halteres pendurados abaixo do peito.",
    "Abra os braços para os lados até a altura dos ombros, juntando as escápulas.",
    "Desça devagar.",
  ], "Trabalha a parte de trás do ombro, que ajuda muito na postura."),
  strength("ombros", "barra", 2, ["ombro", "lombar"], "Standing_Military_Press", "Desenvolvimento militar com barra", "desenvolvimento-barra", [
    "Em pé, segure a barra na frente dos ombros com as mãos um pouco mais abertas que eles.",
    "Empurre a barra para cima da cabeça até estender os braços.",
    "Desça a barra devagar até a altura do queixo.",
  ], "Glúteos e abdômen contraídos para não arquear as costas."),

  // ---------- bíceps ----------
  strength("biceps", "barra", 1, ["punho"], "Barbell_Curl", "Rosca direta com barra", "rosca-direta", [
    "Em pé, segure a barra com as palmas para a frente e os braços estendidos.",
    "Dobre os cotovelos e suba a barra até a altura do peito, cotovelos colados ao corpo.",
    "Desça devagar.",
  ], "Sem balançar o tronco: se precisar, diminua a carga."),
  strength("biceps", "halteres", 1, [], "Dumbbell_Alternate_Bicep_Curl", "Rosca alternada com halteres", "rosca-alternada", [
    "Em pé, um halter em cada mão, braços estendidos ao lado do corpo.",
    "Suba um halter girando a palma para cima, enquanto o outro braço fica parado.",
    "Desça e troque de braço.",
  ], "Gire a palma para cima durante a subida para contrair mais o bíceps."),
  strength("biceps", "halteres", 1, [], "Hammer_Curls", "Rosca martelo", "rosca-martelo", [
    "Em pé, segure os halteres com as palmas viradas uma para a outra.",
    "Dobre os cotovelos e suba os halteres sem girar os punhos.",
    "Desça devagar.",
  ], "Trabalha também o antebraço — ajuda na pegada de outros exercícios."),
  strength("biceps", "halteres", 1, [], "Concentration_Curls", "Rosca concentrada", "rosca-concentrada", [
    "Sente com as pernas abertas e apoie o cotovelo na parte de dentro da coxa.",
    "Suba o halter em direção ao ombro.",
    "Desça até estender o braço. Troque de lado.",
  ], "Faça devagar e sinta o músculo trabalhar."),

  // ---------- tríceps ----------
  strength("triceps", "polia", 1, [], "Triceps_Pushdown", "Tríceps na polia", "triceps-polia", [
    "Em pé, de frente para a polia alta, segure a barra com os cotovelos colados ao corpo.",
    "Empurre a barra para baixo até estender os braços.",
    "Volte devagar até os antebraços passarem da horizontal.",
  ], "Só os antebraços se movem; os cotovelos ficam fixos."),
  strength("triceps", "barra", 2, ["ombro"], "EZ-Bar_Skullcrusher", "Tríceps testa", "triceps-testa", [
    "Deite no banco segurando a barra acima do peito, braços estendidos.",
    "Dobre só os cotovelos e desça a barra em direção à testa.",
    "Estenda os braços de volta.",
  ], "Cotovelos apontando para o teto, sem abrir para os lados."),
  strength("triceps", "peso-corporal", 1, ["ombro", "punho"], "Bench_Dips", "Mergulho no banco", "mergulho-banco", [
    "Sente na beira de um banco ou cadeira firme, mãos apoiadas ao lado do quadril.",
    "Tire o quadril do banco e desça dobrando os cotovelos até uns 90°.",
    "Empurre de volta até estender os braços.",
  ], "Joelhos dobrados deixam mais fácil; pernas estendidas, mais difícil."),
  strength("triceps", "halteres", 1, ["ombro"], "Standing_Dumbbell_Triceps_Extension", "Tríceps francês com halter", "triceps-frances", [
    "Em pé ou sentado, segure um halter com as duas mãos acima da cabeça.",
    "Dobre os cotovelos e desça o halter atrás da cabeça.",
    "Estenda os braços de volta.",
  ], "Mantenha os cotovelos apontando para a frente, perto da cabeça."),
  strength("triceps", "peso-corporal", 2, ["punho"], "Push-Ups_-_Close_Triceps_Position", "Flexão fechada", "flexao-fechada", [
    "Faça a posição de flexão com as mãos mais próximas, embaixo do peito.",
    "Desça com os cotovelos raspando o corpo.",
    "Empurre de volta.",
  ], "Pode apoiar os joelhos para começar."),

  // ---------- pernas ----------
  strength("pernas", "barra", 2, ["joelho", "lombar"], "Barbell_Squat", "Agachamento livre com barra", "agachamento-livre", [
    "Apoie a barra na parte de cima das costas, pés na largura dos ombros.",
    "Desça como se fosse sentar, joelhos na direção dos pés, até as coxas ficarem paralelas ao chão.",
    "Suba empurrando o chão, com o peito aberto.",
  ], "Calcanhares no chão e coluna neutra o tempo todo."),
  strength("pernas", "peso-corporal", 1, ["joelho"], "Bodyweight_Squat", "Agachamento com peso corporal", "agachamento", [
    "Em pé, pés na largura dos ombros, braços à frente ou mãos na cabeça.",
    "Desça levando o quadril para trás até onde conseguir com a coluna reta.",
    "Suba empurrando o chão com os calcanhares.",
  ], "Use uma cadeira atrás como referência de profundidade."),
  strength("pernas", "halteres", 1, ["joelho"], "Goblet_Squat", "Agachamento goblet", "agachamento-goblet", [
    "Segure um halter na vertical junto ao peito, pés um pouco mais abertos que os ombros.",
    "Agache mantendo o peito aberto e os cotovelos entre os joelhos.",
    "Suba empurrando o chão.",
  ], "O peso na frente ajuda a manter o tronco em pé: ótimo para aprender a agachar."),
  strength("pernas", "maquina", 1, ["joelho"], "Leg_Press", "Leg press", "leg-press", [
    "Sente com as costas apoiadas e os pés na plataforma, na largura dos ombros.",
    "Destrave e desça a plataforma dobrando os joelhos até uns 90°.",
    "Empurre de volta sem travar os joelhos.",
  ], "Não deixe o quadril sair do banco na descida."),
  strength("pernas", "halteres", 1, ["joelho"], "Dumbbell_Lunges", "Afundo com halteres", "afundo", [
    "Em pé, um halter em cada mão, dê um passo largo à frente.",
    "Desça até os dois joelhos ficarem perto de 90°.",
    "Empurre com a perna da frente e volte. Alterne as pernas.",
  ], "O joelho da frente fica acima do pé, sem passar muito dos dedos."),
  strength("pernas", "halteres", 2, ["joelho"], "Split_Squat_with_Dumbbells", "Agachamento búlgaro", "bulgaro", [
    "De costas para um banco, apoie o peito do pé de trás nele, halteres nas mãos.",
    "Desça dobrando a perna da frente até a coxa ficar paralela ao chão.",
    "Suba empurrando com o calcanhar da frente. Troque de lado.",
  ], "Exige equilíbrio: comece sem peso."),
  strength("pernas", "maquina", 1, ["joelho"], "Leg_Extensions", "Cadeira extensora", "extensora", [
    "Sente com o apoio sobre os tornozelos e os joelhos alinhados ao eixo da máquina.",
    "Estenda as pernas até ficarem retas.",
    "Desça devagar.",
  ], "Com dor no joelho, prefira carga leve e amplitude menor."),
  strength("pernas", "maquina", 1, [], "Lying_Leg_Curls", "Mesa flexora", "flexora", [
    "Deite de barriga para baixo com o apoio atrás dos tornozelos.",
    "Dobre os joelhos trazendo os calcanhares em direção ao glúteo.",
    "Volte devagar.",
  ], "Mantenha o quadril colado no banco."),
  strength("pernas", "barra", 2, ["lombar"], "Stiff-Legged_Barbell_Deadlift", "Stiff com barra", "stiff", [
    "Em pé, segure a barra à frente das coxas, joelhos levemente dobrados.",
    "Leve o quadril para trás e desça a barra rente às pernas, com a coluna reta.",
    "Suba contraindo glúteos e posterior de coxa.",
  ], "Desça só até onde a coluna continuar reta."),
  strength("pernas", "halteres", 1, ["joelho"], "Plie_Dumbbell_Squat", "Agachamento sumô com halter", "agachamento-sumo", [
    "Pés bem afastados e virados para fora, halter seguro com as duas mãos entre as pernas.",
    "Desça dobrando os joelhos na direção dos pés.",
    "Suba empurrando com os calcanhares.",
  ], "Trabalha bastante a parte de dentro da coxa e os glúteos."),
  strength("pernas", "peso-corporal", 1, ["joelho"], "Bodyweight_Walking_Lunge", "Passada caminhando", "passada", [
    "Em pé, dê um passo largo à frente e desça até os joelhos ficarem perto de 90°.",
    "Suba trazendo a perna de trás para a frente, já no próximo passo.",
    "Continue caminhando, alternando as pernas.",
  ], "Tronco reto e passos firmes."),

  // ---------- glúteos ----------
  strength("gluteos", "barra", 2, [], "Barbell_Hip_Thrust", "Elevação pélvica com barra", "elevacao-pelvica", [
    "Sente no chão com as costas apoiadas num banco e a barra sobre o quadril.",
    "Empurre o chão com os calcanhares e suba o quadril até alinhar com os ombros.",
    "Desça devagar.",
  ], "Use uma proteção na barra e contraia os glúteos no alto."),
  strength("gluteos", "peso-corporal", 1, [], "Butt_Lift_Bridge", "Ponte de glúteo", "ponte", [
    "Deite de costas com os joelhos dobrados e os pés no chão.",
    "Empurre com os calcanhares e suba o quadril até alinhar ombros, quadril e joelhos.",
    "Segure 1 segundo e desça devagar.",
  ], "Para dificultar, faça com uma perna só."),
  strength("gluteos", "polia", 1, ["lombar"], "One-Legged_Cable_Kickback", "Coice na polia", "coice-polia", [
    "Prenda a tornozeleira na polia baixa e segure no aparelho para apoio.",
    "Leve a perna para trás contraindo o glúteo, sem arquear a lombar.",
    "Volte devagar. Troque de lado.",
  ], "Abdômen firme o tempo todo."),
  strength("gluteos", "maquina", 1, [], "Thigh_Abductor", "Cadeira abdutora", "abdutora", [
    "Sente na máquina com as pernas por dentro dos apoios.",
    "Abra as pernas contra a resistência.",
    "Feche devagar.",
  ], "Incline um pouco o tronco à frente para focar mais nos glúteos."),

  // ---------- panturrilhas ----------
  strength("panturrilhas", "peso-corporal", 1, [], "Standing_Calf_Raises", "Panturrilha em pé", "panturrilha-pe", [
    "Em pé, com a ponta dos pés num degrau e os calcanhares para fora.",
    "Suba na ponta dos pés o máximo que conseguir.",
    "Desça abaixo do degrau devagar.",
  ], "Segure em algo para o equilíbrio. Pode segurar halteres para dificultar."),
  strength("panturrilhas", "maquina", 1, [], "Seated_Calf_Raise", "Panturrilha sentado", "panturrilha-sentado", [
    "Sente na máquina com o apoio sobre os joelhos e a ponta dos pés na plataforma.",
    "Suba os calcanhares o máximo possível.",
    "Desça devagar até alongar.",
  ], "Faça a amplitude completa, sem pressa."),

  // ---------- abdômen e core ----------
  strength("abdomen", "peso-corporal", 1, ["ombro"], "Plank", "Prancha", "prancha", [
    "Apoie os antebraços e as pontas dos pés no chão, cotovelos abaixo dos ombros.",
    "Mantenha o corpo reto da cabeça aos pés, abdômen e glúteos contraídos.",
    "Segure a posição respirando normalmente.",
  ], "Não deixe o quadril cair nem subir demais.", "seg"),
  strength("abdomen", "peso-corporal", 1, [], "Crunches", "Abdominal crunch", "abdominal", [
    "Deite de costas com os joelhos dobrados e as mãos ao lado da cabeça.",
    "Tire os ombros do chão contraindo o abdômen.",
    "Desça devagar.",
  ], "Não puxe o pescoço com as mãos; olhe para o teto."),
  strength("abdomen", "peso-corporal", 1, ["ombro"], "Side_Bridge", "Prancha lateral", "prancha-lateral", [
    "Deite de lado e apoie o antebraço no chão, cotovelo abaixo do ombro.",
    "Suba o quadril até o corpo ficar reto.",
    "Segure e depois troque de lado.",
  ], "Apoiar o joelho de baixo deixa mais fácil.", "seg"),
  strength("abdomen", "peso-corporal", 2, ["lombar"], "Flat_Bench_Lying_Leg_Raise", "Elevação de pernas", "elevacao-pernas", [
    "Deite de costas com as pernas estendidas e as mãos sob o quadril ou segurando o banco.",
    "Suba as pernas até ficarem perpendiculares ao chão.",
    "Desça devagar sem encostar no chão.",
  ], "Se a lombar sair do chão, dobre um pouco os joelhos."),
  strength("abdomen", "peso-corporal", 1, [], "Air_Bike", "Abdominal bicicleta", "abdominal-bicicleta", [
    "Deite de costas, mãos ao lado da cabeça, joelhos dobrados no ar.",
    "Aproxime o cotovelo de um lado do joelho oposto, estendendo a outra perna.",
    "Alterne os lados num movimento de pedalar.",
  ], "Devagar e controlado vale mais que rápido."),
  strength("abdomen", "peso-corporal", 2, ["lombar"], "Russian_Twist", "Russian twist", "russian-twist", [
    "Sente com os joelhos dobrados e incline o tronco um pouco para trás.",
    "Gire o tronco para um lado levando as mãos juntas.",
    "Gire para o outro lado.",
  ], "Pés no chão deixam mais fácil; com os pés no ar, mais difícil."),
  strength("abdomen", "peso-corporal", 1, ["punho", "ombro"], "Mountain_Climbers", "Escalador (mountain climber)", "escalador", [
    "Fique na posição de flexão com os braços estendidos.",
    "Traga um joelho em direção ao peito e volte.",
    "Alterne as pernas num ritmo constante.",
  ], "Quadril baixo e abdômen firme.", "seg"),

  // ---------- cardio e corpo inteiro ----------
  cardio("corpo-inteiro", "corda", 1, ["joelho"], "Rope_Jumping", "Pular corda", "pular-corda", [
    "Segure as pontas da corda com os cotovelos perto do corpo.",
    "Gire a corda com os punhos e pule baixo, só o suficiente para ela passar.",
    "Aterrisse na ponta dos pés e mantenha o ritmo.",
  ], "Sem corda? Simule o movimento: o coração agradece igual."),
  cardio("corpo-inteiro", "peso-corporal", 1, ["joelho"], "Star_Jump", "Polichinelo", "polichinelo", [
    "Em pé, pés juntos e braços ao lado do corpo.",
    "Salte abrindo pernas e braços ao mesmo tempo.",
    "Salte de novo fechando. Mantenha o ritmo.",
  ], "Sem impacto: abra uma perna de cada vez, sem saltar."),
  strength("corpo-inteiro", "kettlebell", 2, ["lombar"], "One-Arm_Kettlebell_Swings", "Kettlebell swing", "kettlebell-swing", [
    "Pés afastados, kettlebell entre eles, quadril para trás e coluna reta.",
    "Leve o kettlebell para trás entre as pernas e projete o quadril à frente com força.",
    "Deixe o kettlebell subir até a altura do peito e volte controlando.",
  ], "A força vem do quadril, não dos braços."),

  // ---------- alongamentos ----------
  stretch("corpo-inteiro", 1, ["punho"], "Inchworm", "Caminhada da lagarta (inchworm)", "inchworm", [
    "Em pé, dobre o quadril e apoie as mãos no chão, pernas o mais retas possível.",
    "Caminhe com as mãos para a frente até a posição de flexão.",
    "Volte caminhando com os pés em direção às mãos, em passos curtos.",
  ], "Ótimo para aquecer o corpo todo antes do treino."),
  stretch("corpo-inteiro", 2, [], "Worlds_Greatest_Stretch", "Alongamento completo (world's greatest)", "alongamento-completo", [
    "Dê um passo à frente em afundo e apoie as duas mãos no chão por dentro do pé da frente.",
    "Leve o cotovelo do lado da perna da frente em direção ao pé e depois gire o tronco abrindo esse braço para o teto.",
    "Volte, estenda a perna da frente para alongar o posterior e troque de lado.",
  ], "Alonga quadril, costas e posterior de coxa num só movimento."),
  stretch("pernas", 1, [], "Quad_Stretch", "Alongamento de quadríceps", "along-quadriceps", [
    "Deite de lado e passe uma faixa ou toalha pelo pé de cima.",
    "Dobre o joelho levando o calcanhar em direção ao glúteo.",
    "Puxe a faixa com suavidade até sentir a frente da coxa alongar. Troque de lado.",
  ], "Em pé também vale: segure o pé atrás do corpo, joelhos juntos."),
  stretch("pernas", 1, [], "Hamstring_Stretch", "Alongamento de posterior de coxa", "along-posterior", [
    "Deite de costas e passe uma faixa ou toalha pela planta de um pé.",
    "Suba a perna estendida, mantendo a outra apoiada no chão.",
    "Puxe a faixa com suavidade até sentir a parte de trás da coxa. Troque de lado.",
  ], "Joelho levemente dobrado é melhor que forçar a perna reta."),
  stretch("pernas", 1, [], "Seated_Floor_Hamstring_Stretch", "Alongamento de posterior sentado", "along-posterior-sentado", [
    "Sente com uma perna estendida e a sola do outro pé encostada na parte de dentro da coxa.",
    "Incline o tronco à frente a partir do quadril, levando as mãos em direção ao tornozelo.",
    "Segure e troque de lado.",
  ], "Leve o peito em direção ao joelho, não a cabeça."),
  stretch("panturrilhas", 1, [], "Calf_Stretch_Hands_Against_Wall", "Alongamento de panturrilha na parede", "along-panturrilha", [
    "Apoie as mãos na parede e dê um passo para trás com uma perna.",
    "Mantenha o calcanhar de trás no chão e a perna esticada.",
    "Incline o corpo em direção à parede até sentir a panturrilha. Troque de lado.",
  ], "Dobrar o joelho de trás alonga a parte mais baixa da panturrilha."),
  stretch("gluteos", 1, [], "Lying_Glute", "Alongamento de glúteo deitado", "along-gluteo", [
    "Deite de costas e cruze o tornozelo sobre o joelho oposto, formando um 4.",
    "Segure a coxa da perna de baixo e puxe em direção ao peito.",
    "Segure até sentir o glúteo alongar. Troque de lado.",
  ], "Ajuda a aliviar a tensão de quem passa muito tempo sentado."),
  stretch("pernas", 1, ["joelho"], "Kneeling_Hip_Flexor", "Alongamento do flexor do quadril", "along-flexor-quadril", [
    "Ajoelhe com uma perna à frente, pé apoiado e joelho a 90°.",
    "Contraia o glúteo da perna de trás e leve o quadril à frente.",
    "Segure até sentir a frente do quadril alongar. Troque de lado.",
  ], "Coloque uma almofada embaixo do joelho de apoio."),
  stretch("pernas", 1, [], "Standing_Hip_Flexors", "Alongamento do quadril em pé", "along-quadril-pe", [
    "Em pé, dê um pequeno passo à frente com uma perna.",
    "Dobre os dois joelhos e leve o quadril de trás para a frente.",
    "Segure e troque de lado.",
  ], "Versão sem apoiar o joelho no chão."),
  stretch("pernas", 1, [], "Groin_and_Back_Stretch", "Borboleta", "borboleta", [
    "Sente com os joelhos dobrados e as solas dos pés juntas.",
    "Segure os pés e deixe os joelhos caírem para os lados.",
    "Incline o tronco à frente devagar e segure.",
  ], "Alonga a parte de dentro da coxa e a lombar."),
  stretch("pernas", 1, [], "Runners_Stretch", "Alongamento do corredor", "along-corredor", [
    "Em pé, leve uma perna para trás e desça o tronco até apoiar as mãos ao lado do pé da frente.",
    "Mantenha o calcanhar da frente no chão.",
    "Suba o quadril devagar para alongar o posterior da perna da frente. Troque de lado.",
  ], "Bom para depois de correr ou caminhar."),
  stretch("peito", 1, ["ombro"], "Chest_And_Front_Of_Shoulder_Stretch", "Alongamento de peitoral e ombro", "along-peitoral", [
    "Em pé, segure um bastão ou cabo de vassoura com as mãos mais abertas que os ombros.",
    "Com os braços estendidos, leve o bastão para cima e para trás da cabeça, devagar.",
    "Pare quando sentir o peito e a frente dos ombros alongarem.",
  ], "Abra mais as mãos se o movimento estiver difícil."),
  stretch("ombros", 1, [], "Shoulder_Stretch", "Alongamento de ombro cruzado", "along-ombro", [
    "Leve um braço estendido para o outro lado, na frente do peito.",
    "Com a outra mão, puxe o braço pelo cotovelo em direção ao corpo.",
    "Segure e troque de lado.",
  ], "Mantenha o ombro baixo, longe da orelha."),
  stretch("triceps", 1, [], "Triceps_Stretch", "Alongamento de tríceps", "along-triceps", [
    "Levante um braço e dobre o cotovelo, levando a mão às costas.",
    "Com a outra mão, empurre o cotovelo para trás com suavidade.",
    "Segure e troque de lado.",
  ], "Mantenha a cabeça reta, sem empurrá-la para a frente."),
  stretch("biceps", 1, ["ombro"], "Standing_Biceps_Stretch", "Alongamento de bíceps", "along-biceps", [
    "Entrelace as mãos atrás das costas com os braços estendidos.",
    "Gire as palmas para baixo.",
    "Levante os braços devagar até sentir a frente dos braços alongar.",
  ], "Peito aberto e ombros para trás."),
  stretch("costas", 1, [], "Cat_Stretch", "Gato-camelo", "gato-camelo", [
    "Fique de quatro, mãos abaixo dos ombros e joelhos abaixo do quadril.",
    "Arredonde as costas para cima, levando o queixo ao peito.",
    "Depois afunde as costas e olhe para a frente. Alterne devagar.",
  ], "Ótimo para soltar a coluna de manhã ou depois de muito tempo sentado."),
  stretch("costas", 1, ["joelho"], "Childs_Pose", "Postura da criança", "postura-crianca", [
    "Ajoelhe e sente sobre os calcanhares.",
    "Incline o tronco à frente e estenda os braços no chão.",
    "Relaxe a testa no chão e respire fundo.",
  ], "Afaste os joelhos se a barriga incomodar."),
  stretch("costas", 1, [], "Spinal_Stretch", "Torção da coluna sentado", "torcao-coluna", [
    "Sente numa cadeira com as costas retas e os pés no chão.",
    "Entrelace as mãos atrás da cabeça.",
    "Gire o tronco para um lado, volte e gire para o outro.",
  ], "Gire a partir do meio das costas, sem forçar."),
  stretch("costas", 1, [], "Hug_Knees_To_Chest", "Joelhos ao peito", "joelhos-peito", [
    "Deite de costas.",
    "Abrace os dois joelhos e puxe-os em direção ao peito.",
    "Segure respirando fundo.",
  ], "Alivia a lombar depois de exercícios de pernas."),
  stretch("costas", 1, [], "Upper_Back_Stretch", "Alongamento da parte alta das costas", "along-costas-alta", [
    "Entrelace os dedos à frente do corpo com os polegares para baixo.",
    "Estenda os braços à frente e arredonde os ombros.",
    "Segure sentindo a região entre as escápulas.",
  ], "Bom para quem trabalha no computador."),
  stretch("abdomen", 1, [], "Standing_Lateral_Stretch", "Alongamento lateral do tronco", "along-lateral", [
    "Em pé, pés afastados, leve um braço para cima da cabeça.",
    "Incline o tronco para o lado oposto.",
    "Segure e troque de lado.",
  ], "Não gire o tronco: incline só para o lado."),
  stretch("pescoco", 1, [], "Side_Neck_Stretch", "Alongamento lateral do pescoço", "along-pescoco", [
    "Sente ou fique em pé com os ombros relaxados.",
    "Incline a cabeça para um lado, levando a orelha em direção ao ombro.",
    "Se quiser, apoie a mão do mesmo lado na cabeça. Segure e troque de lado.",
  ], "Movimento suave: nunca puxe com força."),
];

export const GROUPS = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  pernas: "Pernas",
  gluteos: "Glúteos",
  panturrilhas: "Panturrilhas",
  abdomen: "Abdômen",
  "corpo-inteiro": "Corpo inteiro",
  pescoco: "Pescoço",
};

export const EQUIPMENT = {
  "peso-corporal": "Peso corporal",
  halteres: "Halteres",
  barra: "Barra",
  "barra-fixa": "Barra fixa",
  maquina: "Máquina",
  polia: "Polia",
  kettlebell: "Kettlebell",
  corda: "Corda",
};

export const TYPES = {
  forca: "Força",
  cardio: "Cardio",
  alongamento: "Alongamento",
};

export const IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
