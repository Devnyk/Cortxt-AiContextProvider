import inquirer from "inquirer";

export class Dropdown {
  constructor(choices, opts = {}) {
    this.choices = choices;
    this.multi = opts.multi || false;
  }

  async run(callback) {
    if (this.multi) {
      // multi-select mode
      const { selected } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selected",
          message: "Select one or more files:",
          choices: this.choices.map((c) => ({
            name: typeof c === "string" ? c : c.label,
            value: typeof c === "string" ? c : c.value,
          })),
        },
      ]);
      callback(selected);
    } else {
      // single-select mode
      const { selected } = await inquirer.prompt([
        {
          type: "list",
          name: "selected",
          message: "Select a file:",
          choices: this.choices.map((c) => ({
            name: typeof c === "string" ? c : c.label,
            value: typeof c === "string" ? c : c.value,
          })),
        },
      ]);
      callback([selected]);
    }
  }
}
