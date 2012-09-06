/**
 * list function: all books, as HTML list
 */
function(head, req){
    provides("html", function(){
        //send("<html><body>");
        send("<ul>");
        while (row = getRow()) {
            send(renderBook(row));
        }
        send("</ul>");
        //send("</body></html>");
    });
}

function renderBook(row){
    var title = row.value.title || "[No title]";
    var authorPart = "";
    if (row.value.authors && row.value.authors.length > 0) {
        if (row.value.authors[0].length > 0) {
            authorPart = " by " + row.value.authors[0];
        }
    }
    return '<li><a href="#"' + row.id + '>' + title + '</a>' + authorPart + '</li>';
}
