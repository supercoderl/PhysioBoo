import { GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { environment } from "../environments/environment.development";

export function provideOAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
        // 2.2.0 (the pinned version) injects this string token; SOCIAL_AUTH_CONFIG only exists in later releases.
        provide: 'SocialAuthServiceConfig',
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
