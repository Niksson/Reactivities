import {makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import {Activity} from "../models/Activity";
import {v4 as uuid} from "uuid";

export default class ActivityStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = true;

    constructor() {
        makeAutoObservable(this);
    }

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );
    }
    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    };

    loadActivities = async () => {
        this.setLoadingInitial(true);
        try {
            const activities = await agent.Activities.list();
            activities.forEach(a => {
                a.date = a.date.split("T")[0];
                this.activityRegistry.set(a.id, a);
            });
            this.setLoadingInitial(false);
        } catch (error) {
            console.error(error);
            this.setLoadingInitial(false);
        }
    };

    selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id);
    };

    cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    };

    openForm = (id?: string) => {
        id ? this.selectActivity(id) : this.cancelSelectedActivity();
        this.editMode = true;
    };

    closeForm = () => {
        this.editMode = false;
    };

    createActivity = async (activity: Activity) => {
        this.loading = true;
        activity.id = uuid();
        try {
            await agent.Activities.create(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        } catch (error) {
            console.error(error);
            runInAction(() => (this.loading = false));
        }
    };

    updateActivity = async (activity: Activity) => {
        this.loading = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        } catch (error) {
            console.error(error);
            runInAction(() => (this.loading = false));
        }
    };

    deleteActivity = async (id: string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                if (this.selectedActivity?.id === id)
                    this.cancelSelectedActivity();
                this.loading = false;
            });
        } catch (error) {
            console.error(error);
            runInAction(() => (this.loading = false));
        }
    };
}
