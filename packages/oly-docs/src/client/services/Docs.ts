import { inject, state } from "oly";
import { IHrefQuery, Router } from "oly-react";
import { IDocs, IModuleContent } from "../../shared/interfaces";

export interface ISearchItem {
  href: string;
  module: string;
  name: string;
}

export interface ISearchItemOptions {
  href: IHrefQuery;
  module: string;
  name: string;
}

export class Docs {
  @state data: IDocs;
  @inject router: Router;

  get modules(): IModuleContent[] {
    return this.data.modules;
  }

  public get services(): ISearchItem[] {

    const results: ISearchItem[] = [];

    const push = (result: ISearchItemOptions) => {
      const href = this.router.href(result.href);
      if (!href) {
        return;
      }
      if (!results.filter((r) => r.href === href)[0]) {
        results.push({
          ...result,
          href,
        });
      }
    };

    for (const m of this.data.modules) {
      for (const s of m.services) {
        push({
          href: {
            to: "service",
            params: {
              module: m.name,
              service: s.name,
            },
          },
          module: m.name,
          name: s.name,
        });
      }
    }

    return results;
  }

  public search(query: string): ISearchItem[] {
    const results: ISearchItem[] = [];
    const queryCleaned = query.trim().toUpperCase();
    const push = (result: ISearchItemOptions) => {
      const href = this.router.href(result.href);
      if (!href) {
        return false;
      }
      if (!results.filter((r) => r.href === href)[0]) {
        results.push({
          ...result,
          href,
        });
      }
      return results.length > 8;
    };
    for (const m of this.data.modules) {
      for (const d of m.decorators) {
        const dId = d.name.toUpperCase();
        const dId2 = "@" + dId;
        if (dId.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "decorator",
                params: {
                  module: m.name,
                  decorator: d.name,
                },
              },
              module: m.name,
              name: "@" + d.name,
            })) {
            return results;
          }
        } else if (dId2.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "decorator",
                params: {
                  module: m.name,
                  decorator: d.name,
                },
              },
              module: m.name,
              name: "@" + d.name,
            })) {
            return results;
          }
        }
      }
      for (const d of m.components) {
        const dId = d.name.toUpperCase();
        const dId2 = "<" + dId;
        if (dId.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "component",
                params: {
                  module: m.name,
                  component: d.name,
                },
              },
              module: m.name,
              name: "<" + d.name + "/>",
            })) {
            return results;
          }
        } else if (dId2.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "component",
                params: {
                  module: m.name,
                  component: d.name,
                },
              },
              module: m.name,
              name: "<" + d.name + "/>",
            })) {
            return results;
          }
        }
      }
      for (const ev of m.env) {
        const dEv = ev.name.toUpperCase();
        if (dEv.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "configuration",
                params: {
                  module: m.name,
                },
              },
              module: m.name,
              name: ev.name.replace(/"/gmi, ""),
            })) {
            return results;
          }
        }
      }
      for (const s of m.services) {
        const sId = s.name.toUpperCase();
        if (sId.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "service",
                params: {
                  module: m.name,
                  service: s.name,
                },
              },
              module: m.name,
              name: s.name,
            })) {
            return results;
          }
        }
        if (s.name.indexOf("Provider") === -1) {
          for (const me of s.methods) {
            const meId = me.name.toUpperCase();
            const ultraQueryCleaned = queryCleaned.replace(sId, "").replace(/[#.]/, "");
            if (meId.indexOf(ultraQueryCleaned) > -1) {
              if (push({
                  href: {
                    to: "method",
                    params: {
                      module: m.name,
                      service: s.name,
                      method: me.name,
                    },
                  },
                  module: m.name,
                  name: s.name + "#" + me.name + "()",
                })) {
                return results;
              }
            }
          }
        }
      }
      for (const manual of m.manuals) {
        const dEv = manual.name.toUpperCase();
        if (dEv.indexOf(queryCleaned) > -1) {
          if (push({
              href: {
                to: "manual",
                params: {
                  module: m.name,
                  manual: manual.name,
                },
              },
              module: m.name,
              name: manual.name + ".md",
            })) {
            return results;
          }
        }
      }
    }
    return results;
  }
}
