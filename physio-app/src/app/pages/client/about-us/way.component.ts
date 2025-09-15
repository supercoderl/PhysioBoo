import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'way-about-us',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="bg-white pb-15 block">
        <div class="container mx-auto">
            <div class="bg-secondary rounded-[25px] relative overflow-hidden">
                <div class="relative">
                    <div class="absolute top-15 right-50">
                        <img
                            alt=""
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVAAAABWCAYAAACZxs5wAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAjDSURBVHgB7d2NkdNIEAXgNgnARYAuApwBugiODFAGkAG+CFgi2CUClghsItglApsIvETQN30aH8YrzQz2PI3xvK/KBVtM+a2k1tj6QS3iqeo791prb+te1+7VCJjLeHaQvfY/PxMwWz6/nFuffedenUzA5bTutdzLXk6Y3fm83bb+NMW29tnnVGfvWWd0sr2d6dAaWdy+sNaBbFhx++ztSPa1ALn3f63j3gmQ9pPImFcCpP1Erayzy6+zargV+VbDlgKi/adyyEJAdHyH2ukEQMM71E4rANp/Gwmx3wsymWj/rTeEdZY3t1idVUX7w4mY55KZ9odUMVsB0PhEYiA7tMYnEnMlABqfSEwnAJpWZ3PJTFlnIZA6q8kT90op2j8lv5RcK/7sk7fTZBpzjDZhTCMYTaYxx0jZ3o3kl/KN+hLrLGV9vxA6iU2gD1LGJmXQbDb7Jvk9ZBpzjI2Uc+7LXaoWzXfJ79zXN2KZq2IT6MfImI2bxFaSmXvPjftjFRkW+/djrSReuF8Elx1zKxifE8aUyi5aZ24cYiJbSbzO7gUj5X1R27oeGr5CaWBXZiPniOwEeCMgGr54tgZnXwWyPwmQhs9FLgRE+3OR60B2JyDuveeB3FrrDHbRrjraT6LLgcKC3tbis1t9vGPZ75L9gsJAdjeS3QiYy1gMFLUVPPS+RO0nspuBbf1WwArX2Zx1Nl2d1WK2/4MvJluxD+6QBnVoMUh/3FJRMnvjD/mmyrV1vduB70GHkWPZjfQXMCxzUyq7wLY+hxqvps6IiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIjoks0kE/+orr+lf1SYPc19NdUju/zzJF/6H7+63BuZgH9MWCd9bxl7RNgXlz3JU74Hsj8jnug+kt1Kv74b97KWKzcTbutWytVZ67MN64xO5x/QO9Tve634PuP2gN67kexGgEYe0Kv+92kESPt+30Mta98LmI73lUf3s2edTZ/9ulSdVUPDrXJt5cOe+K3hFhH2b6ge57E2KMge542GwYpb461yOwGx5Ypks87yZ4dwEj1Vwko21wLg3vdVQjakTYWGe83stAKgj1tiDEHt0OtI7p0A6PnX2UIAtNI6+508kdOkfOq3gtEmjEH1vU55X9Q3oiLrXH+04Qixw01Ef/WSdTbPNOYYKXXWCkbJdf7bOHUCPfdPoD+knJLr5tL6q5dclynZTwWDvYvO3KkT6CrTGFQ26krl14QxK8FIaYS2kcz8le7YDr0B9lePSdkmqOxYz/tjpSwTqjHefaYxFJJwrqQRAI33GV8Ds+2c3DaULSDat4EOuRIQDfc4N52A6PAV+H2NgGi5OrMaP9c6g5xzro7fyEO3eMB7jev4VUro1X+f3Wq520sWOmyp+L7yYxc2FgJUcZ2VvI2pWJ39LnLeSN/Jj5vZp765upP+Bmc7fPzqs+Hnj3wB727iL5FtE8fu/NvHiW+kt+W2C0a2rW8nzO6kv8DxVMrU2f//YUNYZ0REREREREREREREREREREREREREREREREREREREREREREREREREREREREREdO6yPZH+Evg2BfZ6mOJp32eU3fi/Fsue6qny55DNOqurzi6e77dzrT838LrzrSvQ2Y0+bsy3RPe78dntQPb1RNlvDtb32r3eyQQsZyC7EzBfZ+8HslsBq7jOuoP1vZ2qzqqg8e6erYDoeLOy3Y7VCIh771eBZbZsWNMw7SewMdBuj9pPYGOgO5aG6+yVgGjZOgt197Tsi6yzakRW8n8bWUC0/xQOWQqIhndmsxAA7XfmmFYANPyhsQPZoTXeEnoLzL6OZNdaZ7APrWrocKvcQ61kpv033xTZdyqN9/w2kA8OjU8kBvLtQOMTiYG0SFbW2RhUnXUJ2bdyoidCTaYxvyq1YJ9Kfk2mMcdIWe5GMJpMY45RarlL1tm5b+uTl5kTaN9nO2Yj+aVehfwu+d1nGnOMlOVGLLP5ljBmIxgl66zUOt8kjLnEOquH+xq/KHGI4bOXkWzYiW6Nn5tCHcraIeU2kt0JgKYdUjYCoKyzMQsB0IJ1VhW/osfOT9kGmAuIlr06OtfxArsTIA2fB70SIA1PZAsB0vB50FZA9HzrzLKRV+GL1VlVtJ9Erw429FKBk+dethX3zV7uVqe7P+/w3kDLXiCLei/bTvLfHWRDvvWOZK/3su33gF+RPbM6U9YZZec3NnzDnlO237EbKaBwdnXbumR2rXVGRERERERERERERERERERERERERERERERERERERERERERERER0uWZCJ/OPBuvc66X0fWA27vVhNpuh2hUcZr9xr/le9j8ueyNg/vFgu2xjy/thouzW/fFafvS++ehyb2QCPtuW29a3tY74PGG2Pctyv85suVcCxjqbvs6q4J+tOPakcXSf8dCTxl8LkL2/Dj9p3H4f6AOCdbwV9Rr9zEcd7+yJ7mfPOquozqqh8Va5rYBouN/MVnH9fRoN95tZK67HeadhyB7n7yLZCwHReJ3BnqivddZZq2GwOquG38AxkBVtO0xCNqTvi/ZtKWI6AdB4gzTzXAA03iBtKwDKOgvpBEDT6mzOtsanmWcag8p+IRgp74ta7iZhzF+SmfbfsprIMGsbgZi8m4QxrLO8moQxnEDpKA+ZxqAgsksuT5HeSV7J5f6WMKZonXECPc1K4hvwVnDZMR8F40vCmJVgfE4Yk/3uB3fl1bbzKjJs48al7PS/aiXl6ixlXaLqLCV7JRhF6qw6Gu49DTvB7rOXgey14k6wP9Pw+UDkhZzYhYWFgGj8wkInIBquM9MIiHvvT4HcteIuIlVZZ9XRvsf1IVv56NssrMBuBrLvFH87z9itLUsFt8y19TqSDbmYcZD9Vh/vWJP0Gg/UWStAgTpb115nvJE+E19IdivJ7ibjW3/YN0V26/5o/Y+rKW6sHsi2Zb2fONvW99xnr6b4jws+t5F+mRuffTPhtm6EdVayzn7K/hfaKyQ+cBbYagAAAABJRU5ErkJggg=="
                        />
                    </div>
                    <div class="absolute right-0">
                        <img alt="" src="https://doccure.dreamstechnologies.com/react/template/assets/shape-07-DE-LB4SH.png" />
                    </div>
                </div>
                <div class="grid grid-cols-12 items-end">
                    <div class="col-span-7 px-3">
                        <div class="m-0 p-20">
                            <h2 class="text-white text-[32px] font-bold leading-[1.2]">Be on Your Way to Feeling Better with the Doccure</h2>
                            <p class="font-medium text-base text-info mb-10">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <a
                                class="text-base py-2 px-4 bg-white border border-solid border-white rounded-[44px] text-white relative overflow-hidden z-[1]"
                                href="/react/template/contactus"
                            >
                                Contact With Us
                            </a>
                        </div>
                    </div>
                    <div class="col-span-5 px-3">
                        <div class="relative top-2.5">
                            <img
                                alt=""
                                src="https://doccure.dreamstechnologies.com/react/template/assets/way-img-CThhNvA1.png"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `,
    styles: `
        a {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }
    `
})

export class WayAboutUsComponent {}