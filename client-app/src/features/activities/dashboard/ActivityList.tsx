import {observer} from "mobx-react-lite";
import {Fragment} from "react";
import {Header} from "semantic-ui-react";
import {useStore} from "../../../app/stores/store";
import ActivityListItem from "./ActivityListItem";

const ActivityList = () => {
    const {activityStore} = useStore();
    const {groupedActivities} = activityStore;

    return (
        <>
            {groupedActivities.map(([groupDate, activities]) => (
                <Fragment key={groupDate}>
                    <Header sub color="teal">
                        {groupDate}
                    </Header>

                    {activities.map(activity => (
                        <ActivityListItem
                            key={activity.id}
                            activity={activity}
                        />
                    ))}
                </Fragment>
            ))}
        </>
    );
};

export default observer(ActivityList);
