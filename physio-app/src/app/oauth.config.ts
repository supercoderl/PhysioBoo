import { GoogleLoginProvider, SOCIAL_AUTH_CONFIG, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { environment } from "../environments/environment.development";

export function provideOAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { 
        provide: SOCIAL_AUTH_CONFIG, 
        useValue: {
            autoLogin: false,
            providers: [
                {
                    id: GoogleLoginProvider.PROVIDER_ID,
                    provider: new GoogleLoginProvider(
                        environment.GOOGLE_KEY,
                        {
                            oneTapEnabled: false,
                            prompt: 'select_account'
                        }
                    )
                }
            ],
            onError: (err: unknown) => {
                console.error(err);
            }
        } as SocialAuthServiceConfig
    },
  ]);
}
