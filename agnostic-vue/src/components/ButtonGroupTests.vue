<template>
  <div>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        is-bordered
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        is-bordered
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        is-bordered
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        @click="clickHandler"
      >
        One
      </Button>
      <Button @click="clickHandler">
        Two
      </Button>
      <Button
        is-grouped
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="primary"
        :is-bordered="true"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="primary"
        is-bordered
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="primary"
        is-bordered
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="primary"
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="secondary"
        :is-bordered="true"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="secondary"
        is-bordered
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="secondary"
        is-bordered
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label="Appropriate label for your button group">
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        One
      </Button>
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        Two
      </Button>
      <Button
        is-grouped
        mode="secondary"
        @click="clickHandler"
      >
        Three
      </Button>
    </ButtonGroup>
  </div>
</template>

<script>
import Button from "./Button.vue";
import ButtonGroup from "./ButtonGroup.vue";
import { action } from "@storybook/addon-actions";

const actionsData = {
  clickHandler: action("click"),
};

export default {
  name: "ButtonGroupTests",
  components: { ButtonGroup, Button },
  methods: actionsData,
};
</script>
