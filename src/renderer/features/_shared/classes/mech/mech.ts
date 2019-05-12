import _ from "lodash";
import uid from "@/features/_shared/uid";
import { rules } from 'lancer-data';
import { LicenseRequirement, Pilot, Frame, MechLoadout, Mount, MechWeapon, MechSystem } from '..'

class Mech {
  private id: string;
  private name: string;
  private frame: Frame;
  private loadouts: MechLoadout[];
  private active_loadout?: MechLoadout | null;
  private current_structure: number;
  private current_hp: number;
  private current_stress: number;
  private current_heat: number;
  private current_repairs: number;
  private current_core_energy: number;
  private active: boolean;
  private pilot: Pilot;

  constructor(frame_id: string, pilot: Pilot) {
    this.id = uid.generate();
    this.name = "";
    this.frame = new Frame(frame_id);
    this.pilot = pilot;
    this.loadouts = [];
    this.active = false;
    this.current_structure = this.MaxStructure;
    this.current_hp = this.MaxHP;
    this.current_stress = this.MaxStress;
    this.current_heat = this.HeatCapacity;
    this.current_repairs = this.RepairCapacity;
    this.current_core_energy = 1;
  }

  // -- Info --------------------------------------------------------------------------------------
  public get ID(): string {
    return this.id;
  }

  public RenewID() {
    this.id = uid.generate();
  }

  public get Name(): string {
    return this.name;
  }

  public get Frame(): Frame {
    return this.frame;
  }
  
  public get IsActive() {
    return this.active;
  }

  public set Active(toggle: boolean) {
    this.active = toggle;
  }

  public get RequiredLicenses(): LicenseRequirement[] {
    let requirements = [] as LicenseRequirement[];
    const frameRequirement =
      this.frame.Name.toUpperCase() === "EVEREST"
        ? { name: "GMS", rank: 0, items: ["EVEREST Frame"], missing: false }
        : {
            name: `${this.frame.Source} ${this.frame.Name}`,
            rank: 2,
            items: [`${this.frame.Name.toUpperCase()} Frame`]
          };

    requirements.push(frameRequirement);

    if (this.ActiveLoadout) {
      requirements.concat(this.ActiveLoadout.RequiredLicenses);
    }

    for (const l of requirements) {
      if (l.name === "GMS") continue;
      l.missing = !this.pilot.has("License", l.name, l.rank);
    }

    return requirements.sort((a, b) => {
      return a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0;
    });
  }

  public get Active(): boolean {
    return this.active;
  }

  // -- Attributes --------------------------------------------------------------------------------
  public get Size(): number {
    if (this.frame.Size === rules.max_frame_size) return rules.max_frame_size;
    const bonus = this.pilot.has("CoreBonus", "fomorian");
    if (bonus) {
      return this.frame.Size === 0.5 ? 1 : this.frame.Size + 1;
    } else return this.frame.Size;
  }

  public get Armor(): number {
    let bonus =
      this.pilot.has("CoreBonus", "plating") &&
      this.frame.Armor < rules.max_mech_armor
        ? 1
        : 0;
    return this.frame.Armor + bonus;
  }

  public get SaveTarget(): number {
    let bonus = this.pilot.Grit;
    if (this.pilot.has("CoreBonus", "opendoor")) bonus += 1;
    return this.frame.Save + bonus;
  }

  public get Evasion(): number {
    let bonus = this.Agi;
    if (this.pilot.has("CoreBonus", "fssync")) bonus += 1;
    return this.frame.Evasion + bonus;
  }

  public get Speed(): number {
    let bonus = Math.floor(this.Agi / 2);
    return this.frame.Speed + bonus;
  }

  public get SensorRange(): number {
    return this.frame.SensorRange;
  }

  public get EDefense(): number {
    let bonus = this.Sys;
    if (this.pilot.has("CoreBonus", "disbelief")) bonus += 2;
    return this.frame.Edef + bonus;
  }

  public get LimitedBonus(): number {
    let bonus = 0;
    if (this.pilot.has("CoreBonus", "ammofeeds")) bonus += 2;
    return Math.floor(this.Eng / 2) + bonus;
  }

  public get AttackBonus(): number {
    return this.pilot.Grit;
  }

  public get TechAttack(): number {
    let bonus = this.Sys;
    return this.frame.TechAttack + bonus;
  }

  public get Grapple(): number {
    return rules.base_grapple;
  }

  public get Ram(): number {
    return rules.base_ram;
  }

  public get SaveBonus(): number {
    return this.pilot.Grit;
  }

  // -- HASE --------------------------------------------------------------------------------------
  public get Hull(): number {
    return this.pilot.MechSkills.Hull;
  }

  public get Agi(): number {
    return this.pilot.MechSkills.Agi;
  }

  public get Sys(): number {
    return this.pilot.MechSkills.Sys;
  }

  public get Eng(): number {
    return this.pilot.MechSkills.Eng;
  }

  // -- Stats -------------------------------------------------------------------------------------
  public get CurrentStructure(): number {
    return this.active ? this.current_structure : this.MaxStructure;
  }

  public set CurrentStructure(structure: number) {
    if (structure > this.MaxStructure)
      this.current_structure = this.MaxStructure;
    else if (structure < 0) this.current_structure = 0;
    else this.current_structure = structure;
  }

  public get MaxStructure(): number {
    return this.frame.Structure;
  }

  public get CurrentHP(): number {
    return this.active ? this.current_hp : this.MaxHP;
  }

  public set CurrentHP(hp: number) {
    if (hp > this.MaxHP) this.current_hp = this.MaxHP;
    else if (hp < 0) this.current_hp = 0;
    else this.current_hp = hp;
  }

  public get MaxHP(): number {
    let bonus = this.pilot.Grit + this.Hull * 2;
    if (this.ActiveLoadout && this.ActiveLoadout.HasSystem("personalizations"))
      bonus += 2;
    if (this.pilot.has("CoreBonus", "frame")) bonus += 5;
    return this.frame.HP + bonus;
  }

  public get CurrentSP(): number {
    if (!this.ActiveLoadout) return this.MaxSP;
    return this.ActiveLoadout.TotalSP;
  }

  public get MaxSP(): number {
    let bonus = this.pilot.Grit + Math.floor(this.Sys / 2);
    return this.Frame.SP + bonus;
  }

  public get CurrentHeat(): number {
    return this.active ? this.current_heat : this.HeatCapacity;
  }

  public set CurrentHeat(heat: number) {
    if (heat > this.HeatCapacity) this.current_heat = this.HeatCapacity;
    else if (heat < 0) this.current_heat = 0;
    else this.current_heat = heat;
  }

  public get HeatCapacity(): number {
    var bonus = this.Eng;
    if (this.pilot.has("CoreBonus", "superior")) bonus += 2;
    return this.frame.HeatCap + bonus;
  }

  public get CurrentStress(): number {
    return this.active ? this.current_stress : this.MaxStress;
  }

  public set CurrentStress(stress: number) {
    if (stress > this.MaxStress) this.current_stress = this.MaxStress;
    else if (stress < 0) this.current_stress = 0;
    else this.current_stress = stress;
  }

  public get MaxStress(): number {
    return this.frame.HeatStress;
  }

  public get CurrentRepairs(): number {
    return this.active ? this.current_repairs : this.RepairCapacity;
  }

  public set CurrentRepairs(rep: number) {
    if (rep > this.RepairCapacity) this.current_repairs = this.RepairCapacity;
    else if (rep < 0) this.current_repairs = 0;
    else this.current_repairs = rep;
  }

  public get RepairCapacity(): number {
    var bonus = Math.floor(this.Hull / 2);
    return this.frame.RepCap + bonus;
  }

  public get CurrentCoreEnergy(): number {
    return this.active ? this.current_core_energy : 1;
  }

  public set CurrentCoreEnergy(energy: number) {
    this.current_core_energy = energy < 1 ? 0 : 1;
  }

  // -- Integrated/Talents ------------------------------------------------------------------------
  //TODO: find better way to collect these
  public get IntegratedMounts(): Mount[] {
    let intg = [];
    if (this.frame.CoreSystem.Integrated) {
      intg.push(
        new Mount(MountType.Integrated, this.frame.CoreSystem.Integrated)
      );
    }
    if (this.pilot.has("Talent", "ncavalier", 3)) {
      intg.push(new Mount(MountType.Integrated, new MechWeapon("fuelrod")));
    }
    if (this.pilot.has("Talent", "eng")) {
      const id = `prototype${this.pilot.getTalentRank("eng")}`;
      intg.push(new Mount(MountType.Integrated, new MechWeapon(id)));
    }
    return intg;
  }

  public get IntegratedSystems(): MechSystem[] {
    let intg = [];
    if (this.pilot.has("Talent", "armsman")) {
      const id = `armsman${this.pilot.getTalentRank("armsman")}`;
      intg.push(new MechSystem(id));
    }
    if (this.pilot.has("Talent", "techno")) {
      const id = `techno${this.pilot.getTalentRank("techno")}`;
      intg.push(new MechSystem(id));
    }
    return intg;
  }

  // -- Loadouts ----------------------------------------------------------------------------------
  public get Loadouts(): MechLoadout[] {
    return this.loadouts;
  }

  public AddLoadout() {
    this.loadouts.push(new MechLoadout(this));
  }

  public RemoveLoadout(loadout: MechLoadout) {
    const index = this.loadouts.findIndex(x => _.isEqual(x, loadout));
    if (index === -1) {
      console.error(
        `Loadout"${loadout.Name}" does not exist on Mech ${this.Name}`
      );
    } else {
      this.loadouts.splice(index, 1);
    }
  }

  public CloneLoadout(loadout: MechLoadout) {
    const index = this.loadouts.findIndex(x => _.isEqual(x, loadout));
    if (index === -1) {
      console.error(
        `Loadout "${loadout.Name}" does not exist on Mech ${this.Name}`
      );
    } else {
      this.loadouts.splice(index + 1, 0, new MechLoadout(this));
    }
  }

  public ClearLoadouts() {
    this.loadouts = [];
    this.ActiveLoadout = null;
  }

  public get ActiveLoadout(): MechLoadout | null {
    return this.active_loadout || null;
  }

  public set ActiveLoadout(loadout: MechLoadout | null) {
    this.active_loadout = loadout;
  }
}

export default Mech;