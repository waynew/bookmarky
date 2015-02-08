function destroy(id, title){
    if (confirm("Really destroy <" + title + ">?")){
        $.ajax({
            url: '/bookmark/delete/'+id,
            type: 'DELETE'
        }).success(function(){
            window.location.reload();
        });
    }
}
