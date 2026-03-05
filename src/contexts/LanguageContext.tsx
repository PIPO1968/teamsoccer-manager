import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'it' | 'de' | 'pl' | 'pt' | 'fr' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Landing Page
    'landing.title': 'Manager Game | Join the free football world',
    'landing.getTeam': 'Get your team',
    'landing.getTeamDesc': 'Get started with your own team - we are always looking for new talent!',
    'landing.signIn': 'Sign In',
    'landing.signUp': 'Sign up',
    'landing.buildTrain': 'Build and train your team',
    'landing.buildTrainDesc': 'Develop your team through training. Find your finances. Pick your best players.',
    'landing.compete': 'Compete in leagues',
    'landing.competeDesc': 'Join competitive leagues and tournaments. Rise through divisions.',
    'landing.matchExp': 'Match experience',
    'landing.matchExpDesc': 'Watch live matches with our real-time match simulator.',
    'landing.community': 'Community',
    'landing.communityDesc': 'Join a vibrant community of managers from around the world.',
    'landing.discordTitle': 'Join the development community sharing ideas and insights!',
    'landing.chooseLanguage': 'Choose language',
    
    // Navigation
    'nav.myClub': 'My Club',
    'nav.world': 'World',
    'nav.groups': 'Groups',
    'nav.forums': 'Forums',
    'nav.community': 'Community',
    'nav.help': 'Help',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Mailbox',
    
    // Sidebar Menu
    'sidebar.overview': 'Overview',
    'sidebar.club': 'Club',
    'sidebar.players': 'Players',
    'sidebar.training': 'Training',
    'sidebar.matches': 'Matches',
    'sidebar.league': 'League',
    'sidebar.stadium': 'Stadium',
    'sidebar.finances': 'Finances',
    'sidebar.transfers': 'Transfers',
    'sidebar.challenges': 'Challenges',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Sign in to',
    'auth.signInDesc': 'Enter your email to access your team',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.signIn': 'Sign In',
    'auth.signingIn': 'Signing in...',
    'auth.noAccount': "Don't have an account?",
    'auth.createAccount': 'Create an Account',
    'auth.createAccountDesc': 'Sign up to start your soccer manager career',
    'auth.haveAccount': 'Already have an account?',
    'auth.terms': 'By continuing, you agree to our Terms of Service and Privacy Policy.',

    // Player attributes
    'player.skill.finishing': 'Finishing', 'player.skill.pace': 'Pace',
    'player.skill.passing': 'Passing', 'player.skill.defense': 'Defense',
    'player.skill.dribbling': 'Dribbling', 'player.skill.heading': 'Heading',
    'player.skill.stamina': 'Stamina', 'player.skill.goalkeeper': 'Goalkeeper',
    'player.category.technical': 'Technical', 'player.category.physical': 'Physical',
    'player.form.excellent': 'Excellent', 'player.form.good': 'Good',
    'player.form.average': 'Average', 'player.form.poor': 'Poor',
    'player.fitness': 'Fitness', 'player.goals': 'Goals', 'player.assists': 'Assists',
    'player.value': 'Value', 'player.wage': 'Wage', 'player.age': 'Age',
  },
  es: {
    // Landing Page
    'landing.title': 'Juego de Manager | Únete al mundo del fútbol gratuito',
    'landing.getTeam': 'Consigue tu equipo',
    'landing.getTeamDesc': '¡Comienza con tu propio equipo - siempre estamos buscando nuevos talentos!',
    'landing.signIn': 'Iniciar Sesión',
    'landing.signUp': 'Registrarse',
    'landing.buildTrain': 'Construye y entrena tu equipo',
    'landing.buildTrainDesc': 'Desarrolla tu equipo mediante entrenamiento. Gestiona tus finanzas. Elige tus mejores jugadores.',
    'landing.compete': 'Compite en ligas',
    'landing.competeDesc': 'Únete a ligas competitivas y torneos. Asciende de división.',
    'landing.matchExp': 'Experiencia de partido',
    'landing.matchExpDesc': 'Observa partidos en vivo con nuestro simulador en tiempo real.',
    'landing.community': 'Comunidad',
    'landing.communityDesc': 'Únete a una comunidad vibrante de managers de todo el mundo.',
    'landing.discordTitle': '¡Únete a la comunidad de desarrollo compartiendo ideas y conocimientos!',
    'landing.chooseLanguage': 'Elegir idioma',
    
    // Navigation
    'nav.myClub': 'Mi Club',
    'nav.world': 'Mundo',
    'nav.groups': 'Grupos',
    'nav.forums': 'Foros',
    'nav.community': 'Comunidad',
    'nav.help': 'Ayuda',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Buzón',
    
    // Sidebar Menu
    'sidebar.overview': 'Resumen',
    'sidebar.club': 'Club',
    'sidebar.players': 'Jugadores',
    'sidebar.training': 'Entrenamiento',
    'sidebar.matches': 'Partidos',
    'sidebar.league': 'Liga',
    'sidebar.stadium': 'Estadio',
    'sidebar.finances': 'Finanzas',
    'sidebar.transfers': 'Transferencias',
    'sidebar.challenges': 'Desafíos',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Iniciar sesión en',
    'auth.signInDesc': 'Introduce tu email para acceder a tu equipo',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.createAccount': 'Crear una Cuenta',
    'auth.createAccountDesc': 'Regístrate para comenzar tu carrera como manager de fútbol',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'auth.terms': 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.',

    // Atributos de jugador
    'player.skill.finishing': 'Definición', 'player.skill.pace': 'Velocidad',
    'player.skill.passing': 'Pase', 'player.skill.defense': 'Defensa',
    'player.skill.dribbling': 'Regate', 'player.skill.heading': 'Cabeceo',
    'player.skill.stamina': 'Resistencia', 'player.skill.goalkeeper': 'Portería',
    'player.category.technical': 'Técnicas', 'player.category.physical': 'Físicas',
    'player.form.excellent': 'Excelente', 'player.form.good': 'Buena',
    'player.form.average': 'Normal', 'player.form.poor': 'Mala',
    'player.fitness': 'Forma Física', 'player.goals': 'Goles', 'player.assists': 'Asistencias',
    'player.value': 'Valor', 'player.wage': 'Salario', 'player.age': 'Edad',
  },
  it: {
    // Landing Page
    'landing.title': 'Gioco Manager | Unisciti al mondo del calcio gratuito',
    'landing.getTeam': 'Ottieni la tua squadra',
    'landing.getTeamDesc': 'Inizia con la tua squadra - stiamo sempre cercando nuovi talenti!',
    'landing.signIn': 'Accedi',
    'landing.signUp': 'Registrati',
    'landing.buildTrain': 'Costruisci e allena la tua squadra',
    'landing.buildTrainDesc': 'Sviluppa la tua squadra attraverso allenamenti. Gestisci le finanze. Scegli i tuoi migliori giocatori.',
    'landing.compete': 'Competi nelle leghe',
    'landing.competeDesc': 'Unisciti a leghe competitive e tornei. Sali di divisione.',
    'landing.matchExp': 'Esperienza di partita',
    'landing.matchExpDesc': 'Guarda partite dal vivo con il nostro simulatore in tempo reale.',
    'landing.community': 'Comunità',
    'landing.communityDesc': 'Unisciti a una comunità vibrante di manager da tutto il mondo.',
    'landing.discordTitle': 'Unisciti alla comunità di sviluppo condividendo idee e intuizioni!',
    'landing.chooseLanguage': 'Scegli lingua',
    
    // Navigation
    'nav.myClub': 'Il Mio Club',
    'nav.world': 'Mondo',
    'nav.groups': 'Gruppi',
    'nav.forums': 'Forum',
    'nav.community': 'Comunità',
    'nav.help': 'Aiuto',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Posta',
    
    // Sidebar Menu
    'sidebar.overview': 'Panoramica',
    'sidebar.club': 'Club',
    'sidebar.players': 'Giocatori',
    'sidebar.training': 'Allenamento',
    'sidebar.matches': 'Partite',
    'sidebar.league': 'Lega',
    'sidebar.stadium': 'Stadio',
    'sidebar.finances': 'Finanze',
    'sidebar.transfers': 'Trasferimenti',
    'sidebar.challenges': 'Sfide',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Accedi a',
    'auth.signInDesc': 'Inserisci la tua email per accedere alla tua squadra',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Password dimenticata?',
    'auth.signIn': 'Accedi',
    'auth.signingIn': 'Accedendo...',
    'auth.noAccount': 'Non hai un account?',
    'auth.createAccount': 'Crea un Account',
    'auth.createAccountDesc': 'Registrati per iniziare la tua carriera da manager di calcio',
    'auth.haveAccount': 'Hai già un account?',
    'auth.terms': 'Continuando, accetti i nostri Termini di Servizio e la Politica sulla Privacy.',

    // Attributi giocatore
    'player.skill.finishing': 'Finalizzazione', 'player.skill.pace': 'Velocità',
    'player.skill.passing': 'Passaggio', 'player.skill.defense': 'Difesa',
    'player.skill.dribbling': 'Dribbling', 'player.skill.heading': 'Colpo di testa',
    'player.skill.stamina': 'Resistenza', 'player.skill.goalkeeper': 'Portiere',
    'player.category.technical': 'Tecniche', 'player.category.physical': 'Fisiche',
    'player.form.excellent': 'Eccellente', 'player.form.good': 'Buona',
    'player.form.average': 'Nella media', 'player.form.poor': 'Scarsa',
    'player.fitness': 'Forma', 'player.goals': 'Gol', 'player.assists': 'Assist',
    'player.value': 'Valore', 'player.wage': 'Stipendio', 'player.age': 'Età',
  },
  de: {
    // Landing Page
    'landing.title': 'Manager-Spiel | Tritt der kostenlosen Fußballwelt bei',
    'landing.getTeam': 'Hol dir dein Team',
    'landing.getTeamDesc': 'Starte mit deinem eigenen Team - wir suchen immer nach neuen Talenten!',
    'landing.signIn': 'Anmelden',
    'landing.signUp': 'Registrieren',
    'landing.buildTrain': 'Baue und trainiere dein Team',
    'landing.buildTrainDesc': 'Entwickle dein Team durch Training. Verwalte deine Finanzen. Wähle deine besten Spieler.',
    'landing.compete': 'In Ligen antreten',
    'landing.competeDesc': 'Tritt kompetitiven Ligen und Turnieren bei. Steige in Divisionen auf.',
    'landing.matchExp': 'Spielerlebnis',
    'landing.matchExpDesc': 'Schaue Live-Spiele mit unserem Echtzeit-Simulator.',
    'landing.community': 'Gemeinschaft',
    'landing.communityDesc': 'Tritt einer lebendigen Gemeinschaft von Managern aus aller Welt bei.',
    'landing.discordTitle': 'Tritt der Entwicklungsgemeinschaft bei und teile Ideen und Einsichten!',
    'landing.chooseLanguage': 'Sprache wählen',
    
    // Navigation
    'nav.myClub': 'Mein Verein',
    'nav.world': 'Welt',
    'nav.groups': 'Gruppen',
    'nav.forums': 'Foren',
    'nav.community': 'Gemeinschaft',
    'nav.help': 'Hilfe',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Postfach',
    
    // Sidebar Menu
    'sidebar.overview': 'Übersicht',
    'sidebar.club': 'Verein',
    'sidebar.players': 'Spieler',
    'sidebar.training': 'Training',
    'sidebar.matches': 'Spiele',
    'sidebar.league': 'Liga',
    'sidebar.stadium': 'Stadion',
    'sidebar.finances': 'Finanzen',
    'sidebar.transfers': 'Transfers',
    'sidebar.challenges': 'Herausforderungen',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Anmelden bei',
    'auth.signInDesc': 'Gib deine E-Mail ein, um auf dein Team zuzugreifen',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.signIn': 'Anmelden',
    'auth.signingIn': 'Anmeldung...',
    'auth.noAccount': 'Hast du kein Konto?',
    'auth.createAccount': 'Konto erstellen',
    'auth.createAccountDesc': 'Registriere dich, um deine Fußball-Manager-Karriere zu starten',
    'auth.haveAccount': 'Hast du bereits ein Konto?',
    'auth.terms': 'Durch Fortfahren stimmst du unseren Nutzungsbedingungen und der Datenschutzrichtlinie zu.',

    // Spieler-Attribute
    'player.skill.finishing': 'Abschluss', 'player.skill.pace': 'Tempo',
    'player.skill.passing': 'Pass', 'player.skill.defense': 'Abwehr',
    'player.skill.dribbling': 'Dribbling', 'player.skill.heading': 'Kopfball',
    'player.skill.stamina': 'Ausdauer', 'player.skill.goalkeeper': 'Torwart',
    'player.category.technical': 'Technisch', 'player.category.physical': 'Physisch',
    'player.form.excellent': 'Ausgezeichnet', 'player.form.good': 'Gut',
    'player.form.average': 'Durchschnittlich', 'player.form.poor': 'Schlecht',
    'player.fitness': 'Fitness', 'player.goals': 'Tore', 'player.assists': 'Vorlagen',
    'player.value': 'Marktwert', 'player.wage': 'Gehalt', 'player.age': 'Alter',
  },
  pl: {
    // Landing Page
    'landing.title': 'Gra Menedżerska | Dołącz do darmowego świata piłki nożnej',
    'landing.getTeam': 'Zdobądź swoją drużynę',
    'landing.getTeamDesc': 'Rozpocznij ze swoją drużyną - zawsze szukamy nowych talentów!',
    'landing.signIn': 'Zaloguj się',
    'landing.signUp': 'Zarejestruj się',
    'landing.buildTrain': 'Buduj i trenuj swoją drużynę',
    'landing.buildTrainDesc': 'Rozwijaj swoją drużynę poprzez treningi. Zarządzaj finansami. Wybierz najlepszych graczy.',
    'landing.compete': 'Rywalizuj w ligach',
    'landing.competeDesc': 'Dołącz do konkurencyjnych lig i turniejów. Awansuj w dywizjach.',
    'landing.matchExp': 'Doświadczenie meczowe',
    'landing.matchExpDesc': 'Oglądaj mecze na żywo z naszym symulatorem czasu rzeczywistego.',
    'landing.community': 'Społeczność',
    'landing.communityDesc': 'Dołącz do żywej społeczności menedżerów z całego świata.',
    'landing.discordTitle': 'Dołącz do społeczności deweloperskiej dzieląc się pomysłami i spostrzeżeniami!',
    'landing.chooseLanguage': 'Wybierz język',
    
    // Navigation
    'nav.myClub': 'Mój Klub',
    'nav.world': 'Świat',
    'nav.groups': 'Grupy',
    'nav.forums': 'Fora',
    'nav.community': 'Społeczność',
    'nav.help': 'Pomoc',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Skrzynka',
    
    // Sidebar Menu
    'sidebar.overview': 'Przegląd',
    'sidebar.club': 'Klub',
    'sidebar.players': 'Zawodnicy',
    'sidebar.training': 'Trening',
    'sidebar.matches': 'Mecze',
    'sidebar.league': 'Liga',
    'sidebar.stadium': 'Stadion',
    'sidebar.finances': 'Finanse',
    'sidebar.transfers': 'Transfery',
    'sidebar.challenges': 'Wyzwania',
    'sidebar.manager': 'Menedżer',
    
    // Auth
    'auth.signInTitle': 'Zaloguj się do',
    'auth.signInDesc': 'Wprowadź swój email, aby uzyskać dostęp do swojej drużyny',
    'auth.email': 'Email',
    'auth.password': 'Hasło',
    'auth.forgotPassword': 'Zapomniałeś hasła?',
    'auth.signIn': 'Zaloguj się',
    'auth.signingIn': 'Logowanie...',
    'auth.noAccount': 'Nie masz konta?',
    'auth.createAccount': 'Utwórz Konto',
    'auth.createAccountDesc': 'Zarejestruj się, aby rozpocząć karierę menedżera piłkarskiego',
    'auth.haveAccount': 'Masz już konto?',
    'auth.terms': 'Kontynuując, zgadzasz się na nasze Warunki Usługi i Politykę Prywatności.',

    // Atrybuty zawodnika
    'player.skill.finishing': 'Wykończenie', 'player.skill.pace': 'Szybkość',
    'player.skill.passing': 'Podanie', 'player.skill.defense': 'Obrona',
    'player.skill.dribbling': 'Drybling', 'player.skill.heading': 'Główka',
    'player.skill.stamina': 'Wytrzymałość', 'player.skill.goalkeeper': 'Bramkarz',
    'player.category.technical': 'Techniczne', 'player.category.physical': 'Fizyczne',
    'player.form.excellent': 'Doskonała', 'player.form.good': 'Dobra',
    'player.form.average': 'Przeciętna', 'player.form.poor': 'Słaba',
    'player.fitness': 'Kondycja', 'player.goals': 'Gole', 'player.assists': 'Asysty',
    'player.value': 'Wartość', 'player.wage': 'Pensja', 'player.age': 'Wiek',
  },
  pt: {
    // Landing Page
    'landing.title': 'Jogo de Manager | Junte-se ao mundo do futebol gratuito',
    'landing.getTeam': 'Obtenha sua equipe',
    'landing.getTeamDesc': 'Comece com sua própria equipe - estamos sempre procurando novos talentos!',
    'landing.signIn': 'Entrar',
    'landing.signUp': 'Cadastrar-se',
    'landing.buildTrain': 'Construa e treine sua equipe',
    'landing.buildTrainDesc': 'Desenvolva sua equipe através de treinos. Gerencie suas finanças. Escolha seus melhores jogadores.',
    'landing.compete': 'Compita em ligas',
    'landing.competeDesc': 'Junte-se a ligas competitivas e torneios. Suba de divisão.',
    'landing.matchExp': 'Experiência de partida',
    'landing.matchExpDesc': 'Assista partidas ao vivo com nosso simulador em tempo real.',
    'landing.community': 'Comunidade',
    'landing.communityDesc': 'Junte-se a uma comunidade vibrante de managers de todo o mundo.',
    'landing.discordTitle': 'Junte-se à comunidade de desenvolvimento compartilhando ideias e insights!',
    'landing.chooseLanguage': 'Escolher idioma',
    
    // Navigation
    'nav.myClub': 'Meu Clube',
    'nav.world': 'Mundo',
    'nav.groups': 'Grupos',
    'nav.forums': 'Fóruns',
    'nav.community': 'Comunidade',
    'nav.help': 'Ajuda',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Caixa de Mensagens',
    
    // Sidebar Menu
    'sidebar.overview': 'Visão Geral',
    'sidebar.club': 'Clube',
    'sidebar.players': 'Jogadores',
    'sidebar.training': 'Treinamento',
    'sidebar.matches': 'Partidas',
    'sidebar.league': 'Liga',
    'sidebar.stadium': 'Estádio',
    'sidebar.finances': 'Finanças',
    'sidebar.transfers': 'Transferências',
    'sidebar.challenges': 'Desafios',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Entrar em',
    'auth.signInDesc': 'Digite seu email para acessar sua equipe',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.signIn': 'Entrar',
    'auth.signingIn': 'Entrando...',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.createAccount': 'Criar uma Conta',
    'auth.createAccountDesc': 'Cadastre-se para começar sua carreira como manager de futebol',
    'auth.haveAccount': 'Já tem uma conta?',
    'auth.terms': 'Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.',

    // Atributos do jogador
    'player.skill.finishing': 'Finalização', 'player.skill.pace': 'Velocidade',
    'player.skill.passing': 'Passe', 'player.skill.defense': 'Defesa',
    'player.skill.dribbling': 'Drible', 'player.skill.heading': 'Cabeceio',
    'player.skill.stamina': 'Resistência', 'player.skill.goalkeeper': 'Guarda-redes',
    'player.category.technical': 'Técnicas', 'player.category.physical': 'Físicas',
    'player.form.excellent': 'Excelente', 'player.form.good': 'Boa',
    'player.form.average': 'Normal', 'player.form.poor': 'Má',
    'player.fitness': 'Forma', 'player.goals': 'Golos', 'player.assists': 'Assistências',
    'player.value': 'Valor', 'player.wage': 'Salário', 'player.age': 'Idade',
  },
  fr: {
    // Landing Page
    'landing.title': 'Jeu de Manager | Rejoignez le monde du football gratuit',
    'landing.getTeam': 'Obtenez votre équipe',
    'landing.getTeamDesc': 'Commencez avec votre propre équipe - nous recherchons toujours de nouveaux talents !',
    'landing.signIn': 'Se connecter',
    'landing.signUp': 'S\'inscrire',
    'landing.buildTrain': 'Construisez et entraînez votre équipe',
    'landing.buildTrainDesc': 'Développez votre équipe grâce à l\'entraînement. Gérez vos finances. Choisissez vos meilleurs joueurs.',
    'landing.compete': 'Participez aux ligues',
    'landing.competeDesc': 'Rejoignez des ligues compétitives et des tournois. Montez en division.',
    'landing.matchExp': 'Expérience de match',
    'landing.matchExpDesc': 'Regardez des matchs en direct avec notre simulateur en temps réel.',
    'landing.community': 'Communauté',
    'landing.communityDesc': 'Rejoignez une communauté dynamique de managers du monde entier.',
    'landing.discordTitle': 'Rejoignez la communauté de développement en partageant des idées et des insights !',
    'landing.chooseLanguage': 'Choisir la langue',
    
    // Navigation
    'nav.myClub': 'Mon Club',
    'nav.world': 'Monde',
    'nav.groups': 'Groupes',
    'nav.forums': 'Forums',
    'nav.community': 'Communauté',
    'nav.help': 'Aide',
    'nav.premium': 'Premium',
    'nav.mailbox': 'Boîte mail',
    
    // Sidebar Menu
    'sidebar.overview': 'Aperçu',
    'sidebar.club': 'Club',
    'sidebar.players': 'Joueurs',
    'sidebar.training': 'Entraînement',
    'sidebar.matches': 'Matchs',
    'sidebar.league': 'Ligue',
    'sidebar.stadium': 'Stade',
    'sidebar.finances': 'Finances',
    'sidebar.transfers': 'Transferts',
    'sidebar.challenges': 'Défis',
    'sidebar.manager': 'Manager',
    
    // Auth
    'auth.signInTitle': 'Se connecter à',
    'auth.signInDesc': 'Entrez votre email pour accéder à votre équipe',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.signIn': 'Se connecter',
    'auth.signingIn': 'Connexion...',
    'auth.noAccount': 'Vous n\'avez pas de compte ?',
    'auth.createAccount': 'Créer un compte',
    'auth.createAccountDesc': 'Inscrivez-vous pour commencer votre carrière de manager de football',
    'auth.haveAccount': 'Vous avez déjà un compte ?',
    'auth.terms': 'En continuant, vous acceptez nos Conditions d\'utilisation et notre Politique de confidentialité.',

    // Attributs du joueur
    'player.skill.finishing': 'Finition', 'player.skill.pace': 'Vitesse',
    'player.skill.passing': 'Passe', 'player.skill.defense': 'Défense',
    'player.skill.dribbling': 'Dribble', 'player.skill.heading': 'Jeu de tête',
    'player.skill.stamina': 'Endurance', 'player.skill.goalkeeper': 'Gardien',
    'player.category.technical': 'Techniques', 'player.category.physical': 'Physiques',
    'player.form.excellent': 'Excellente', 'player.form.good': 'Bonne',
    'player.form.average': 'Moyenne', 'player.form.poor': 'Mauvaise',
    'player.fitness': 'Forme', 'player.goals': 'Buts', 'player.assists': 'Passes déc.',
    'player.value': 'Valeur', 'player.wage': 'Salaire', 'player.age': 'Âge',
  },
  zh: {
    // Landing Page
    'landing.title': '经理游戏 | 加入免费足球世界',
    'landing.getTeam': '获得您的球队',
    'landing.getTeamDesc': '从您自己的团队开始 - 我们一直在寻找新人才！',
    'landing.signIn': '登录',
    'landing.signUp': '注册',
    'landing.buildTrain': '建设和训练您的球队',
    'landing.buildTrainDesc': '通过训练发展您的团队。管理您的财务。选择您最好的球员。',
    'landing.compete': '参加联赛竞争',
    'landing.competeDesc': '加入竞争联赛和锦标赛。在分区中升级。',
    'landing.matchExp': '比赛体验',
    'landing.matchExpDesc': '通过我们的实时比赛模拟器观看现场比赛。',
    'landing.community': '社区',
    'landing.communityDesc': '加入来自世界各地经理的充满活力的社区。',
    'landing.discordTitle': '加入开发社区，分享想法和见解！',
    'landing.chooseLanguage': '选择语言',
    
    // Navigation
    'nav.myClub': '我的俱乐部',
    'nav.world': '世界',
    'nav.groups': '群组',
    'nav.forums': '论坛',
    'nav.community': '社区',
    'nav.help': '帮助',
    'nav.premium': '高级版',
    'nav.mailbox': '邮箱',
    
    // Sidebar Menu
    'sidebar.overview': '概览',
    'sidebar.club': '俱乐部',
    'sidebar.players': '球员',
    'sidebar.training': '训练',
    'sidebar.matches': '比赛',
    'sidebar.league': '联赛',
    'sidebar.stadium': '体育场',
    'sidebar.finances': '财务',
    'sidebar.transfers': '转会',
    'sidebar.challenges': '挑战',
    'sidebar.manager': '经理',
    
    // Auth
    'auth.signInTitle': '登录到',
    'auth.signInDesc': '输入您的电子邮件以访问您的团队',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'auth.forgotPassword': '忘记密码？',
    'auth.signIn': '登录',
    'auth.signingIn': '登录中...',
    'auth.noAccount': '没有账户？',
    'auth.createAccount': '创建账户',
    'auth.createAccountDesc': '注册开始您的足球经理职业生涯',
    'auth.haveAccount': '已有账户？',
    'auth.terms': '继续即表示您同意我们的服务条款和隐私政策。',

    // 球员属性
    'player.skill.finishing': '完成射门', 'player.skill.pace': '速度',
    'player.skill.passing': '传球', 'player.skill.defense': '防守',
    'player.skill.dribbling': '盘带', 'player.skill.heading': '头球',
    'player.skill.stamina': '体力', 'player.skill.goalkeeper': '守门',
    'player.category.technical': '技术', 'player.category.physical': '体能',
    'player.form.excellent': '出色', 'player.form.good': '良好',
    'player.form.average': '一般', 'player.form.poor': '差',
    'player.fitness': '体能状态', 'player.goals': '进球', 'player.assists': '助攻',
    'player.value': '市值', 'player.wage': '薪资', 'player.age': '年龄',
  },
};

const languageNames = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  de: 'Deutsch',
  pl: 'Polski',
  pt: 'Português',
  fr: 'Français',
  zh: '中文',
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { languageNames };
