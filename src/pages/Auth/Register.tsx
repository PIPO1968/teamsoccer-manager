import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GAME_NAME, GAME_LOGO } from "@/config/constants";
import { useLanguage } from "@/contexts/LanguageContext";

const countries: Record<string, string[]> = {
  "Europe": [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
    'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
    'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'Norway',
    'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia',
    'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
  ],
  "North America": [
    'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
    'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
    'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
  ],
  "South America": [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
    'Peru', 'Suriname', 'Uruguay', 'Venezuela'
  ],
  "Asia": [
    'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei',
    'Cambodia', 'China', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
    'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives',
    'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines',
    'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan',
    'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan',
    'Vietnam', 'Yemen'
  ],
  "Africa": [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
    'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo',
    'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia',
    'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
    'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
    'Niger', 'Nigeria', 'Republic of the Congo', 'Rwanda', 'Sao Tome and Principe', 'Senegal',
    'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania',
    'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ],
  "Oceania": [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
    'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
  ],
  "Dependencies & Territories": [
    'American Samoa', 'Anguilla', 'Antarctica', 'Aruba', 'Bermuda',
    'British Indian Ocean Territory', 'British Virgin Islands', 'Cayman Islands', 
    'Christmas Island', 'Cocos Islands', 'Cook Islands', 'Curacao', 'Faroe Islands', 
    'Falkland Islands', 'French Polynesia', 'Gibraltar', 'Greenland', 'Guam', 'Guernsey', 
    'Hong Kong', 'Isle of Man', 'Jersey', 'Kosovo', 'Macau', 'Montserrat', 'New Caledonia', 
    'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Pitcairn', 
    'Puerto Rico', 'Saint Barthelemy', 'Saint Helena', 'Saint Martin', 
    'Saint Pierre and Miquelon', 'Sint Maarten', 'Svalbard and Jan Mayen', 
    'Tokelau', 'Turks and Caicos Islands', 'U.S. Virgin Islands', 
    'Wallis and Futuna', 'Western Sahara'
  ]
};

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1">
              <img src={GAME_LOGO} alt={GAME_NAME} className="h-full w-auto" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.createAccount')}</CardTitle>
          <CardDescription>
            {t('auth.createAccountDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm onSuccess={handleSuccess} countries={countries} />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.haveAccount')}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t('landing.signIn')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
