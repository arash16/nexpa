var popupsContainer = nx();
registerGlobalElement(<div>{popupsContainer}</div>);

spa.activatePopup = function (el) {
    popupsContainer(el);
    return () => spa.deactivatePopup(el);
};

spa.deactivatePopup = function (el) {
    if (popupsContainer.peek() == el)
        popupsContainer(undefined);
};
