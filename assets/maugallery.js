(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i - 1;
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i + 1;
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active.active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);


/////////////////////////////////// Test modification avec CHATGPT 05/03/2024
/*
(function ($) {
  $.fn.mauGallery = function (options) {
      var settings = $.extend({}, $.fn.mauGallery.defaults, options);
      var tagsCollection = [];

      return this.each(function () {
          var $this = $(this);
          createRowWrapper($this);
          if (settings.lightBox) {
              createLightBox($this, settings.lightboxId, settings.navigation);
          }
          createGalleryListeners(settings);
          $this.children(".gallery-item").each(function (index) {
              var $item = $(this);
              responsiveImageItem($item);
              moveItemInRowWrapper($item);
              wrapItemInColumn($item, settings.columns);
              var theTag = $item.data("gallery-tag");
              if (settings.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
                  tagsCollection.push(theTag);
              }
          });
          if (settings.showTags) {
              showItemTags($this, settings.tagsPosition, tagsCollection);
          }
          $this.fadeIn(500);
      });
  };

  $.fn.mauGallery.defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
  };

  function createRowWrapper($element) {
      if (!$element.children().first().hasClass("row")) {
          $element.append('<div class="gallery-items-row row"></div>');
      }
  }

  function wrapItemInColumn($element, columns) {
      var columnClasses = "";
      if (typeof columns === "number") {
          columnClasses = ` col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === "object") {
          columnClasses = createColumnClasses(columns);
      } else {
          console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
          return;
      }
      $element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
  }

  function createColumnClasses(columns) {
      var columnClasses = "";
      if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
      if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
      if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
      if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
      if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
      return columnClasses;
  }

  function moveItemInRowWrapper($element) {
      $element.appendTo(".gallery-items-row");
  }

  function responsiveImageItem($element) {
      if ($element.prop("tagName") === "IMG") {
          $element.addClass("img-fluid");
      }
  }

  function createLightBox($gallery, lightboxId, navigation) {
      var lightboxId = lightboxId ? lightboxId : "galleryLightbox";
      var navigationHTML = navigation ? createNavigationHTML() : '<span style="display:none;" />';
      var lightboxHTML = `<div class="modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-body">
                      ${navigationHTML}
                      <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                      ${navigationHTML}
                  </div>
              </div>
          </div>
      </div>`;
      $gallery.append(lightboxHTML);
  }

  function createNavigationHTML() {
      return `<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>
              <div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>`;
  }

  function createGalleryListeners(options) {
      $(".gallery-item").on("click", function () {
          if (options.lightBox && $(this).prop("tagName") === "IMG") {
              openLightBox($(this), options.lightboxId);
          } else {
              return;
          }
      });

      $(".gallery").on("click", ".nav-link", function () {
          filterByTag($(this));
      });

      $(".gallery").on("click", ".mg-prev", function () {
          prevImage(options.lightboxId);
      });

      $(".gallery").on("click", ".mg-next", function () {
          nextImage(options.lightboxId);
      });
  }

  function openLightBox($element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", $element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
  }

  function prevImage(lightboxId) {
      var $activeImage = $("img.gallery-item[src='" + $(".lightboxImage").attr("src") + "']");
      var activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      var imagesCollection = getImageCollection(activeTag);
      var index = imagesCollection.indexOf($activeImage);
      var prev = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", prev.attr("src"));
  }

  function nextImage(lightboxId) {
      var $activeImage = $("img.gallery-item[src='" + $(".lightboxImage").attr("src") + "']");
      var activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      var imagesCollection = getImageCollection(activeTag);
      var index = imagesCollection.indexOf($activeImage);
      var next = imagesCollection[index + 1] || imagesCollection[0];
      $(".lightboxImage").attr("src", next.attr("src"));
  }

  function getImageCollection(activeTag) {
      var imagesCollection = [];
      if (activeTag === "all") {
          $(".item-column").each(function () {
              if ($(this).children("img").length) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      } else {
          $(".item-column").each(function () {
              if ($(this).children("img").data("gallery-tag") === activeTag) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      }
      return imagesCollection;
  }

  function showItemTags($gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
          tagItems += `<li class="nav-item active"><span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") {
          $gallery.append(tagsRow);
      } else if (position === "top") {
          $gallery.prepend(tagsRow);
      } else {
          console.error(`Unknown tags position: ${position}`);
      }
  }

  function filterByTag($clickedTag) {
      if ($clickedTag.hasClass("active-tag")) {
          return;
      }
      $(".active.active-tag").removeClass("active active-tag");
      $clickedTag.addClass("active-tag active");
      var tag = $clickedTag.data("images-toggle");
      $(".gallery-item").each(function () {
          var $itemColumn = $(this).parents(".item-column");
          $itemColumn.hide();
          if (tag === "all") {
              $itemColumn.show(300);
          } else if ($(this).data("gallery-tag") === tag) {
              $itemColumn.show(300);
          }
      });
  }
})(jQuery);
*/
/*
Déclarations de variables :

Dans le premier code, les variables sont déclarées avec var, ce qui les rend globales ou fonctionnellement locales selon leur portée.
Dans le deuxième code, les variables sont déclarées avec var et let. Cependant, dans certaines fonctions, les variables sont déclarées avec let pour limiter leur portée à la fonction où elles sont utilisées.
Utilisation de fonctions anonymes :

Dans le premier code, les méthodes de la galerie sont définies en tant que propriétés de $.fn.mauGallery.methods.
Dans le deuxième code, les fonctions sont définies en dehors de $.fn.mauGallery, rendant le code plus plat et plus clair.
Utilisation de fonctions de création HTML :

Dans le premier code, la création du HTML pour la LightBox est effectuée à l'intérieur de la méthode createLightBox.
Dans le deuxième code, la création du HTML pour la LightBox est déléguée à une fonction séparée, améliorant la lisibilité et la modularité du code.
Gestion des événements :

Dans le premier code, les écouteurs d'événements sont attachés à l'intérieur de $.fn.mauGallery.listeners.
Dans le deuxième code, les écouteurs d'événements sont attachés dans la fonction createGalleryListeners, ce qui rend le code plus modulaire.
Réutilisation de code :

Dans le premier code, il y a de la duplication de code pour la manipulation des images précédentes et suivantes dans la LightBox.
Dans le deuxième code, la logique pour les images précédentes et suivantes est encapsulée dans les fonctions prevImage et nextImage, réduisant ainsi la duplication du code.
Ces changements contribuent à rendre le deuxième code plus lisible, modulaire et conforme aux meilleures pratiques de développement JavaScript.
*/