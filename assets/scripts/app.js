class Component {
    detach(element) {

        element.remove();
        // this.element.parentElement.removeChild(this.element);
    }

    attach(element) {
        document.body.append(element);
    }
}

class ToolTip extends Component {
    constructor(closeNotifierFunction) {
        super();

        this.closeNotifier = closeNotifierFunction;
    }

    closeToolTip = () => {
        this.detach(this.element);
        this.closeNotifier();
    }


    create() {
        const toolTipElement = document.createElement('div');
        toolTipElement.className = 'card';
        toolTipElement.textContent = 'DUMMY';
        toolTipElement.addEventListener('click', this.closeToolTip.bind(this));
        this.element = toolTipElement;
        this.attach(toolTipElement);

    }
}

class DOMHelper {
    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    static moveElement(elementId, newDestinationSelector) {
        const element = document.getElementById(elementId);

        const destinationElement = document.querySelector(newDestinationSelector);

        destinationElement.append(element);

    }

}


class ProjectItem {
    hasActiveToolTip = false;

    constructor(id, updateProjectListsFunction, type) {
        this.id = id;
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton();
    }

    showMoreInfoHandler() {
        if (this.hasActiveToolTip) {
            return;
        }
        const tooltip = new ToolTip(() => {
            this.hasActiveToolTip = false
        });
        tooltip.create();
        this.hasActiveToolTip = true;
    }


    connectMoreInfoButton() {
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);
    }

    connectSwitchButton(type) {
        const prjItemElement = document.getElementById(this.id);
        let switchBtn = prjItemElement.querySelector('button:last-of-type');
        switchBtn = DOMHelper.clearEventListeners(switchBtn);
        switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
        switchBtn.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
    }

    update(updateProjectListsFn, type) {
        this.updateProjectListsHandler = updateProjectListsFn;
        this.connectSwitchButton(type);
    }
}

class ProjectList {
    projects = [];

    constructor(type) {
        this.type = type;
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        for (const prjItem of prjItems) {
            this.projects.push(new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type));
        }
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchHandler = switchHandlerFunction;

    }


    addProject(project) {
        // console.log(this);
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this), this.type);
    }


    switchProject(projectId) {
        this.switchHandler(this.projects.find(p => p.id === projectId));
        this.projects = this.projects.filter(p => p.id !== projectId);
    }
}

class App {
    static init() {
        const activeProjectsList = new ProjectList('active');
        const finishedProjectsList = new ProjectList('finished');

        activeProjectsList.setSwitchHandlerFunction(finishedProjectsList.addProject.bind(finishedProjectsList));
        finishedProjectsList.setSwitchHandlerFunction(activeProjectsList.addProject.bind(activeProjectsList));
    }
}

App.init();
