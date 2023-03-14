import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";
import { randomizeEmojiDiversity } from "../helpers/emoji-diversity";
import { emojiUnescape } from "discourse/lib/text";
import { htmlSafe } from "@ember/template";
import { registerUnbound } from "discourse-common/lib/helpers";
import I18n from "I18n";
import { escape } from "pretty-text/sanitizer";
import { markdownlint } from "../lib/markdownlint";

// for testing/debugging:
// localStorage.umd_forceShowWarning = '1'

export default {
  name: "unformatted-markdown-detector",
  initialize() {
    withPluginApi("0.8.8", (api) => {
      registerUnbound("umd-modal-title", () => {
        return htmlSafe(
          [
            emojiUnescape(escape(randomizeEmojiDiversity(settings.emoji_icon))),
            escape(I18n.t(themePrefix("warning_umc_modal.title"))),
          ].join(" ")
        );
      });

      api.modifyClass("model:composer", {
        pluginId: 'techcommunity-composer-model',
        umd_shouldPermanentlyDismiss: false,
        umd_markdownlintResult: {},
        umd_checkPermanentlyDismissed: () =>
          !!localStorage.umd_warningPermanentlyDismissed,

        umd_checkShouldIgnoreWarning() {
          if (localStorage.umd_forceShowWarning) return false;

          return (
            this.umd_previousWarningIgnored ||
            this.umd_checkPermanentlyDismissed()
          );
        },

        umd_checkUnformattedMarkdownDetected() {
          const _model = this;

          //Stop process Markdownlint JS if post contains the '[code]'
          if(/\[code\]/i.test(this.reply)){
            return false;
          }

          /**
           * Using Markdownlint lib function to detect the broken markdown
           * We have covered the below Mardown issues:
           * 1. MD020/no-missing-space-closed-atx - No space inside hashes on closed atx style heading
           * 2. MD030/list-marker-space - Spaces after list markers
           * 3. MD031/blanks-around-fences - Fenced code blocks should be surrounded by blank lines
           * 4. MD037/no-space-in-emphasis - Spaces inside emphasis markers
           */

          //Configuration optons for the Markdownlint
          const options = {
            "strings": {
              "content": this.reply
            },
            "resultVersion": 3,
            "config": {
              "comment": "Configuration for the rulkes [MD020, MD030, MD031, MD037]",
              "default": true,

              "MD020": {
                "description": "MD020/no-missing-space-closed-atx - No space inside hashes on closed atx style heading",
                "type": "boolean",
                "default": true
              },
              "no-missing-space-closed-atx": {
                "description": "MD020/no-missing-space-closed-atx - No space inside hashes on closed atx style heading",
                "type": "boolean",
                "default": true
              },

              "MD030": {
                "description": "MD030/list-marker-space - Spaces after list markers",
                "type": [
                  "boolean",
                  "object"
                ],
                "default": true,
                "properties": {
                  "ul_single": {
                    "description": "Spaces for single-line unordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ol_single": {
                    "description": "Spaces for single-line ordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ul_multi": {
                    "description": "Spaces for multi-line unordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ol_multi": {
                    "description": "Spaces for multi-line ordered list items",
                    "type": "integer",
                    "default": 1
                  }
                },
                "additionalProperties": false
              },
              "list-marker-space": {
                "description": "MD030/list-marker-space - Spaces after list markers",
                "type": [
                  "boolean",
                  "object"
                ],
                "default": true,
                "properties": {
                  "ul_single": {
                    "description": "Spaces for single-line unordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ol_single": {
                    "description": "Spaces for single-line ordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ul_multi": {
                    "description": "Spaces for multi-line unordered list items",
                    "type": "integer",
                    "default": 1
                  },
                  "ol_multi": {
                    "description": "Spaces for multi-line ordered list items",
                    "type": "integer",
                    "default": 1
                  }
                },
                "additionalProperties": false
              },

              "MD031": {
                "description": "MD031/blanks-around-fences - Fenced code blocks should be surrounded by blank lines",
                "type": [
                  "boolean",
                  "object"
                ],
                "default": true,
                "properties": {
                  "list_items": {
                    "description": "Include list items",
                    "type": "boolean",
                    "default": true
                  }
                },
                "additionalProperties": false
              },
              "blanks-around-fences": {
                "description": "MD031/blanks-around-fences - Fenced code blocks should be surrounded by blank lines",
                "type": [
                  "boolean",
                  "object"
                ],
                "default": true,
                "properties": {
                  "list_items": {
                    "description": "Include list items",
                    "type": "boolean",
                    "default": true
                  }
                },
                "additionalProperties": false
              },

              "MD037": {
                "description": "MD037/no-space-in-emphasis - Spaces inside emphasis markers",
                "type": "boolean",
                "default": true
              },
              "no-space-in-emphasis": {
                "description": "MD037/no-space-in-emphasis - Spaces inside emphasis markers",
                "type": "boolean",
                "default": true
              },
            }
          };
          //Calling markdownlint function to detect the 
          markdownlint(options, function callback(err, result) {
            if (!err) {
              //console.log(result.toString());
              let customMarkdownlintResult = [];
              //Creating custom result to display user-friendlt error messages
              result.content.forEach(error => {
                if (!error.errorContext) {
                  error.errorContext = error.ruleDescription + " " + error.errorDetail;
                }
                customMarkdownlintResult.push(error);
              });
              //Sorting the error message base on line number
              customMarkdownlintResult.sort((error1, error2) => {
                return error1.lineNumber - error2.lineNumber;
              });

              _model.set('umd_markdownlintResult', customMarkdownlintResult);
            }
          });
          // ------------ End of Merkdown lib Code ----------- //

          //If Markdownlint returns the result then return true so that Warning modal will be display.
          if (this.umd_markdownlintResult && this.umd_markdownlintResult.length > 0) {
            return true;
          }
          else {
            return false;
          }

        },
      });

      api.modifyClass("controller:composer", {
        pluginId: 'techcommunity-composer-controller',
        umd_permanentlyDismiss() {
          localStorage.umd_warningPermanentlyDismissed = "1";
        },

        umd_closeModal() {
          if (this.model.umd_shouldPermanentlyDismiss) {
            this.umd_permanentlyDismiss();
          }
          this.send("closeModal");
        },

        save(...args) {
          const model = this.model;
          const _this = this;
          const _super = this._super;
          if (
            model.umd_checkUnformattedMarkdownDetected() &&
            !model.umd_checkShouldIgnoreWarning()
          ) {
            const warningUmdModal = showModal("umdWarningModal", {
              modalClass: "umd_warning-modal",
              model,
            });
            warningUmdModal.actions.ignoreAndProceed = () => {
              _this.umd_closeModal.call(_this);
              _super.call(_this, ...args);
            };

            warningUmdModal.actions.goBackAndFix = () =>
              _this.umd_closeModal.call(_this);
          } else {
            this._super(...args);
          }
        },
      });
    });
  },
};