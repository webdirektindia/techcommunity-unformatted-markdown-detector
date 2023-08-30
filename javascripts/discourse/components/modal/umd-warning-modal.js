import { gt, or } from "@ember/object/computed";
import Component from "@ember/component";
import EmberObject, { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { observes } from "@ember-decorators/object";
import I18n from "I18n";

export default class UmdWarningModal extends Component {
    /*
        closeModal(true): close the modal & save the post
        closeModal(false): close the modal
    */
    @action
    ignoreAndProceed() {
        this.closeModal(true);
    };

    @action
    goBackAndFix() {
        this.closeModal(false);
    }
}