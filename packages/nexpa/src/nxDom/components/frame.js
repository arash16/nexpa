el.defineComponent('frame', function (props, childs) {
    function frameLoaded() {
        var htmlElem = this.contentWindow.document.body.parentElement;
        htmlElem.style.overflowY = 'hidden';
        function setHeight() {
            frameStyles.height(htmlElem.offsetHeight + 'px');
        }

        addListener(this.contentWindow, 'resize', setHeight);
        setHeight();
    }

    var frameStyles = {
        border: 'none',
        width: '100%',
        height: nx('500px')
    };

    var src = props.src;
    return <iframe src={src} style={frameStyles} onload={frameLoaded}></iframe>;
});
