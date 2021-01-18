"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Form_1 = require("./Form");
var Group_1 = require("./Group");
var Relation = /** @class */ (function () {
    function Relation() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Relation.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Relation.prototype, "userId", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Relation.prototype, "formId", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Relation.prototype, "groupId", void 0);
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "created_at"
        }),
        __metadata("design:type", Date)
    ], Relation.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updated_at"
        }),
        __metadata("design:type", Date)
    ], Relation.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return User_1.User; }, function (user) { return user.relations; }),
        __metadata("design:type", User_1.User)
    ], Relation.prototype, "user", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Form_1.Form; }, function (form) { return form.relations; }),
        __metadata("design:type", Form_1.Form)
    ], Relation.prototype, "form", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Group_1.Group; }, function (group) { return group.relations; }),
        __metadata("design:type", Group_1.Group)
    ], Relation.prototype, "group", void 0);
    Relation = __decorate([
        typeorm_1.Entity()
    ], Relation);
    return Relation;
}());
exports.Relation = Relation;
//# sourceMappingURL=Relation.js.map