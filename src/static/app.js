function generate() {
    var color = document.getElementById('color').value;
    var seed = document.getElementById('seed').value;

    var uri = window.config.diamondUri + '?color=' + color + '&seed=' + seed;
    var imgNode = document.getElementById('logo');
    imgNode.src = uri;

    var linkNode = document.getElementById('logo-link');
    linkNode.href = uri;
    linkNode.innerHTML = uri;
}

window.onload = function() {
    var root = document.getElementById('app');

    root.innerHTML =
       '<div class="main-content content-box">'
      +'    <h4>Logo-generator</h4>'
      +'    <div class="form-group">'
      +'        <div class="form-element>'
      +'           <label for="color">Farge</label>'
      +'           <select id="color" name="color">'
      +'               <option value="red">Rød</option>'
      +'               <option value="blue">Blå</option>'
      +'               <option value="yellow">Gul</option>'
      +'           </select>'
      +'        </div>'
      +'        <div class="form-element mdl-textfield mdl-js-textfield">'
      +'            <label for="seed" class="mdl-textfield__label">Frøtekst</label>'
      +'            <input id="seed" name="seed" type="text" class="mdl-textfield__input">'
      +'        </div>'
      +'    </div>'
      +'    <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" onclick="generate()">'
      +'        Generer'
      +'    </button>'
      +'    <br>'
      +'    <br>'
      +'    <a id="logo-link"></a>'
      +'    <br>'
      +'    <img id="logo" width="512"></img>'
      +'</div>';

    componentHandler.upgradeDom();
};
