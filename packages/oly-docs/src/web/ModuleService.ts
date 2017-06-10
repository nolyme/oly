import { env } from "oly-core";
import { IDocs } from "../cli/interfaces";

export interface ISearchItem {
  href: string;
  module: string;
  name: string;
}

export class ModuleService {

  @env("DOCS") docs: IDocs;

  public getServices(): ISearchItem[] {
    const results: ISearchItem[] = [];
    const push = (result: ISearchItem) => {
      if (!results.filter((r) => r.href === result.href)[0]) {
        results.push(result);
      }
    };
    for (const m of this.docs.modules) {
      for (const s of m.services) {
        push({
          href: "/m/" + m.name + "/s/" + s.name,
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
    const push = (result: ISearchItem) => {
      if (!results.filter((r) => r.href === result.href)[0]) {
        results.push(result);
      }
      return results.length > 8;
    };
    for (const m of this.docs.modules) {
      for (const d of m.decorators) {
        const dId = d.name.toUpperCase();
        const dId2 = "@" + dId;
        if (dId.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/@/" + d.name,
              module: m.name,
              name: "@" + d.name,
            })) {
            return results;
          }
        } else if (dId2.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/@/" + d.name,
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
              href: "/m/" + m.name + "/c/" + d.name,
              module: m.name,
              name: "<" + d.name + "/>",
            })) {
            return results;
          }
        } else if (dId2.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/c/" + d.name,
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
              href: "/m/" + m.name + "/configuration",
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
              href: "/m/" + m.name + "/s/" + s.name,
              module: m.name,
              name: s.name,
            })) {
            return results;
          }
        }
        for (const me of s.methods) {
          const meId = me.name.toUpperCase();
          const ultraQueryCleaned = queryCleaned.replace(sId, "").replace(/[#.]/, "");
          if (meId.indexOf(ultraQueryCleaned) > -1) {
            if (push({
                href: "/m/" + m.name + "/s/" + s.name + "/" + me.name,
                module: m.name,
                name: s.name + "#" + me.name + "()",
              })) {
              return results;
            }
          }
        }
      }
      for (const manual of m.manuals) {
        const dEv = manual.name.toUpperCase();
        if (dEv.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/m/" + manual.name,
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
