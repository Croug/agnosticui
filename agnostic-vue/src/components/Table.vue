<template>
  <div :class="tableResponsiveClasses">
    <table :class="tableClasses">
      <caption :class="captionClasses">
        {{ caption }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="headerCol in headers"
            :key="headerCol.key"
            :aria-sort="getSortDirectionFor(headerCol.key)"
            scope="col"
            :style="{ width: headerCol.width ? headerCol.width : 'auto' }"
          >
            <div
              v-if="headerCol.sortable"
              :class="[$style['table-header-container']]"
            >
              <span :class="[$style['table-sort-label']]">{{ headerCol.label }}</span>
              <button
                type="button"
                :class="[$style['table-sort']]"
                @click="handleSortClicked(headerCol.key)"
              >
                <span :class="'screenreader-only'">{{ headerCol.label }}</span>
                <span :class="getSortingClassesFor(headerCol.key)" />
              </button>
            </div>
            <span v-else>
              {{ headerCol.label }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in sortableItems"
          :key="i"
        >
          <td
            v-for="(key, cIndex) in Object.keys(row)"
            :key="cIndex"
          >
            <div
              v-if="headers[cIndex].renderFn"
              v-html="headers[cIndex].renderFn(row[key])"
            />
            <div v-else>
              {{ row[key] }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { ref, useCssModule, watch } from "vue";
export default {
  name: "AgTable",
  props: {
    headers: {
      type: Array,
      default: () => {
        return [];
      },
    },
    rows: {
      type: Array,
      default: () => {
        return [];
      },
    },
    caption: {
      type: String,
      required: true,
    },
    captionPosition: {
      type: String,
      required: false,
      default: "hidden",
      validator: (value) => ["top", "bottom", "end", "hidden"].includes(value),
    },
    tableSize: {
      type: String,
      required: false,
      default: "",
      validator: (value) => ["", "small", "large", "xlarge"].includes(value),
    },
    responsiveSize: {
      type: String,
      required: false,
      default: "",
      validator: (value) =>
        ["", "small", "medium", "large", "xlarge"].includes(value),
    },
    isUppercasedHeaders: {
      type: Boolean,
      default: false,
    },
    isBordered: {
      type: Boolean,
      default: false,
    },
    isBorderless: {
      type: Boolean,
      default: false,
    },
    isStriped: {
      type: Boolean,
      default: false,
    },
    isHoverable: {
      type: Boolean,
      default: false,
    },
    isStacked: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // https://v3.vuejs.org/api/global-api.html#usecssmodule
    const styles = useCssModule();
    // Essentially equivalent to React's useState('')
    let direction = ref("none");
    let sortingKey = ref("");

    // Cache the unsorted rows for later aria-sort="none" case
    const originalRows = [...props.rows];
    let sortableItems = ref([...originalRows]);

    /**
     * Plucks the columns from rows by key of the current sortingKey; sortingKey
     * reflects the currently being sorted column due to user interaction e.g. they
     * have clicked on that columns table header cell.
     *
     * Since we want to sort rows but by column comparisons, we need to "pluck out"
     * these columns from the two rows. If we cannot find the columns in rows by the
     * `sortingKey`, then we set these to `-Infinity` which places them at the bottom.
     */
    const pluckColumnToSort = (rowLeft, rowRight) => {
      const colLeft =
        rowLeft[sortingKey.value] === null ||
        rowLeft[sortingKey.value] === undefined
          ? -Infinity
          : rowLeft[sortingKey.value];
      const colRight =
        rowRight[sortingKey.value] === null ||
        rowRight[sortingKey.value] === undefined
          ? -Infinity
          : rowRight[sortingKey.value];
      return {
        colLeft,
        colRight,
      };
    };

    /**
     * This function first checks if there is a corresponding custom sort function
     * that was supplied in a header cell with key" of `sortingKey` named `.sortFn`
     * per the API. If it finds, it will delegate to that for actual sort comparison.
     * Otherwise, the function supplies its own fallback default (naive) sorting logic.
     */
    const internalSort = (rowLeft, rowRight) => {
      let { colLeft, colRight } = pluckColumnToSort(rowLeft, rowRight);
      /**
       * First check if the corresponding header cell has a custom sort
       * method. If so, we use that, else we proceed with our default one.
       */
      const headerWithCustomSortFunction = props.headers.find(
        (h) => h.key === sortingKey.value && !!h.sortFn
      );
      if (headerWithCustomSortFunction && headerWithCustomSortFunction.sortFn) {
        return headerWithCustomSortFunction.sortFn(colLeft, colRight);
      }
      // No custom sort method for the header cell, so we continue with our own.
      // Strings converted to lowercase; dollar currency etc. stripped (not yet i18n safe!)
      colLeft =
        typeof colLeft === "string"
          ? colLeft.toLowerCase().replace(/(^\$|,)/g, "")
          : colLeft;
      colRight =
        typeof colRight === "string"
          ? colRight.toLowerCase().replace(/(^\$|,)/g, "")
          : colRight;
      // If raw value represents a number explicitly set to Number
      colLeft = !Number.isNaN(Number(colLeft)) ? Number(colLeft) : colLeft;
      colRight = !Number.isNaN(Number(colRight)) ? Number(colRight) : colRight;
      if (colLeft > colRight) {
        return 1;
      }
      if (colLeft < colRight) {
        return -1;
      }
      return 0;
    };
    // Simply flips the sign of results of the ascending sort
    const descendingSort = (row1, row2) => internalSort(row1, row2) * -1;

    watch([direction, sortingKey], (currentValue) => {
      const newDirection = currentValue[0];

      let rows = props.rows;
      if (newDirection === "ascending") {
        rows.sort(internalSort);
      } else if (newDirection === "descending") {
        rows.sort(descendingSort);
      } else {
        rows = [...originalRows];
      }
      sortableItems.value = rows;
    });

    const getSortDirectionFor = (headerKey) => {
      if (sortingKey.value !== headerKey) {
        return "none";
      } else {
        return direction.value;
      }
    };

    const getSortingClassesFor = (headerKey) => {
      if (sortingKey.value === headerKey) {
        return {
          [styles[`icon-sort-${direction.value}`]]:
            direction && direction.value !== "none",
          [styles["icon-sort"]]: true,
        };
      }
      return {
        [styles["icon-sort"]]: true,
      };
    };

    const handleSortClicked = (headerKey) => {
      // User's clicked a different sort header from the last one
      if (sortingKey.value !== headerKey) {
        // In turn, results in direction transitioning to ascending in switch below.
        direction.value = "none";
        sortingKey.value = headerKey;
      }
      switch (direction.value) {
        case "ascending":
          direction.value = "descending";
          break;
        case "descending":
          direction.value = "none";
          break;
        case "none":
          direction.value = "ascending";
          break;
        default:
          console.warn(
            "Table sorting only supports directions: ascending | descending | none"
          );
      }
    };
    return {
      direction,
      getSortDirectionFor,
      getSortingClassesFor,
      handleSortClicked,
      sortingKey,
      sortableItems,
    };
  },
  computed: {
    captionClasses() {
      return {
        ["screenreader-only"]: this.captionPosition === "hidden",
        [this.$style[`caption-${this.captionPosition}`]]:
          this.captionPosition !== "hidden",
      };
    },
    tableResponsiveClasses() {
      return {
        [this.$style["table-responsive"]]: !this.responsiveSize,
        [this.$style[`table-responsive-${this.responsiveSize}`]]:
          !!this.responsiveSize,
      };
    },
    tableClasses() {
      return {
        [this.$style["table"]]: true,
        [this.$style[`table-${this.tableSize}`]]: this.tableSize,
        [this.$style[`table-caps`]]: this.isUppercasedHeaders,
        [this.$style[`table-bordered`]]: this.isBordered,
        [this.$style[`table-borderless`]]: this.isBorderless,
        [this.$style[`table-striped`]]: this.isStriped,
        [this.$style[`table-hoverable`]]: this.isHoverable,
        [this.$style[`table-stacked`]]: this.isStacked,
      };
    },
  },
};
</script>

  <style module>
.table {
  --table-bg: transparent;
  --table-accent-bg: transparent;
  --table-striped-color: var(--agnostic-dark);
  --table-striped-bg: rgb(0 0 0 / 2.5%);
  --table-active-color: var(--agnostic-dark);
  --table-active-bg: rgb(0 0 0 / 1.5%);
  --table-hoverable-color: var(--agnostic-dark);
  --table-hoverable-bg: var(--agnostic-table-hover-bg, #f1faff);

  width: 100%;
  margin-bottom: var(--fluid-16);
  color: var(--agnostic-dark);
  vertical-align: top;
  border-color: var(--agnostic-table-border-color, var(--agnostic-gray-light));
}

.table > :not(caption) > * > * {
  padding: var(--fluid-8) var(--fluid-8);
  background-color: var(--table-bg);
  border-bottom-width: 1px;

  /* 4th is spread --table-accent-bg will gets reset for active, hover, striped */
  box-shadow: inset 0 0 0 9999px var(--table-accent-bg);
}

.table > tbody {
  vertical-align: inherit;
}

.table > thead {
  vertical-align: bottom;
}

.table thead th {
  font-weight: 600;
}

.table-caps thead th {
  font-size: var(--fluid-12);
  text-transform: uppercase;
}

.table tbody td,
.table tbody th {
  font-weight: 400;
}

.table > :not(thead):not(caption) {
  border-top: var(--fluid-2) solid var(--agnostic-gray-light);
}

.caption-top {
  caption-side: top;
}

.caption-bottom {
  caption-side: bottom;
}

.caption-bottom,
.caption-top {
  padding-block-start: var(--fluid-12);
  padding-block-end: var(--fluid-12);

  /* Takes writing mode into account -- (mdn) same as left if direction is left-to-right
  and right if direction is right-to-left */
  text-align: start;
}

.caption-end {
  text-align: end;
}

.table-small > :not(caption) > * > * {
  padding: var(--fluid-4) var(--fluid-4);
}

.table-large > :not(caption) > * > * {
  padding: var(--fluid-12) var(--fluid-12);
}

.table-xlarge > :not(caption) > * > * {
  padding: var(--fluid-18) var(--fluid-18);
}

.table-bordered > :not(caption) > * {
  border-width: 1px 0;
}

.table-bordered > :not(caption) > * > * {
  border-width: 0 1px;
}

.table-borderless > :not(caption) > * > * {
  border-bottom-width: 0;
}

.table-borderless > :not(:first-child) {
  border-top-width: 0;
}

.table-striped > tbody > tr:nth-of-type(odd) > * {
  --table-accent-bg: var(--table-striped-bg);

  color: var(--table-striped-color);
}

.table-active {
  --table-accent-bg: var(--table-active-bg);

  color: var(--table-active-color);
}

.table-hoverable > tbody > tr:hover > * {
  --table-accent-bg: var(--table-hoverable-bg);

  color: var(--table-hoverable-color);
}

/* Stacked tables */
.table-stacked thead {
  display: none;
}

.table-stacked tr,
.table-stacked tbody th,
.table-stacked tbody td {
  display: block;
  width: 100%;
}

.table-stacked tbody th,
.table-stacked tbody td {
  border-bottom-width: 0;
}

.table-stacked td[data-label] {
  padding-bottom: var(--fluid-12);
}

.table-stacked tr {
  border-bottom: var(--fluid-2) solid var(--agnostic-gray-light);
  border-top-width: 0;
}

.table-stacked th[data-label]::before,
.table-stacked td[data-label]::before {
  content: attr(data-label);
  display: block;
  font-weight: 600;
  margin: -0.5rem -1rem 0;
  padding: var(--fluid-12) var(--fluid-16) var(--fluid-6);
}

.table-stacked tr th:first-child,
.table-stacked tr td:first-child {
  border-top-width: 0;
}

.table-stacked tr:nth-child(odd) td,
.table-stacked tr:nth-child(odd) th {
  background-color: inherit;
}

.table-stacked tr:first-child th:first-child,
.table-stacked tr:first-child td:first-child {
  border-top: var(--fluid-2) solid var(--agnostic-gray-light);
}

.table-stacked th[data-label],
.table-stacked td[data-label] {
  padding-bottom: var(--fluid-12);
}

/* As soon as there's not enough width, it will kick in horizontal scrolling */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Table is responsive only "up to" the breakpoint. Above it will not scroll */
@media (max-width: 576px) {
  .table-responsive-small {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 768px) {
  .table-responsive-medium {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 992px) {
  .table-responsive-large {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 1200px) {
  .table-responsive-xlarge {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.table-header-container {
  display: flex;
  align-items: center;
}

.table-sort-label {
  flex: 1;
  padding-inline-end: 0.5rem;
  text-align: left;
}

.table-sort {
  flex: 0 1 var(--fluid-48);
  background-color: transparent;
  border-color: transparent;
  border-width: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding-block-start: var(--fluid-2);
  padding-block-end: var(--fluid-2);
}

.icon-sort {
  background-image: url("data:image/svg+xml,%3Csvg class='icon-sort' fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='20' height='20'%3E%3Cpath d='m15 13-5 5-5-5M5 7l5-5 5 5' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' /%3E%3C/svg%3E");
  width: 1.125rem;
  height: 1.125rem;
}

.icon-sort-ascending {
  background-image: url("data:image/svg+xml,%3Csvg class='icon-sort' fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='20' height='20'%3E%3Cpath d='m9.221 6.365-4.963 5.86c-.586.693-.11 1.775.78 1.775h9.926c.2 0 .394-.059.561-.17.168-.111.3-.27.383-.457a1.102 1.102 0 0 0-.165-1.147l-4.963-5.86a1.04 1.04 0 0 0-.351-.27 1.007 1.007 0 0 0-1.208.27v-.001Z' fill='%23000' /%3E%3C/svg%3E");
}

.icon-sort-descending {
  background-image: url("data:image/svg+xml,%3Csvg class='icon-sort' fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='20' height='20'%3E%3Cpath d='m10.778 13.635 4.964-5.86c.586-.693.11-1.775-.78-1.775H5.037a1.01 1.01 0 0 0-.561.17c-.168.111-.3.27-.382.457a1.102 1.102 0 0 0 .164 1.147l4.963 5.86a1.006 1.006 0 0 0 1.559 0v.001Z' fill='%23000' /%3E%3C/svg%3E");
}

.table-sort:focus {
  box-shadow: 0 0 0 var(--agnostic-focus-ring-outline-width) var(--agnostic-focus-ring-color);

  /* Needed for High Contrast mode */
  outline:
    var(--agnostic-focus-ring-outline-width) var(--agnostic-focus-ring-outline-style)
    var(--agnostic-focus-ring-outline-color);
  transition: box-shadow var(--agnostic-timing-fast) ease-out;
}

@media (prefers-reduced-motion), (update: slow) {
  .table-sort:focus {
    transition-duration: 0.001ms !important;
  }
}

</style>
