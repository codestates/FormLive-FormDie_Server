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
exports.User = void 0;
var typeorm_1 = require("typeorm");
var Relation_1 = require("./Relation");
var Suggestion_1 = require("./Suggestion");
var Userform_1 = require("./Userform");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], User.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], User.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], User.prototype, "profileIconURL", void 0);
    __decorate([
        typeorm_1.Column('boolean', { default: false }),
        __metadata("design:type", Boolean)
    ], User.prototype, "isAdmin", void 0);
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "created_at"
        }),
        __metadata("design:type", Date)
    ], User.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updated_at"
        }),
        __metadata("design:type", Date)
    ], User.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Relation_1.Relation; }, function (relation) { return relation.user; }),
        __metadata("design:type", Array)
    ], User.prototype, "relations", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Suggestion_1.Suggestion; }, function (suggestion) { return suggestion.user; }),
        __metadata("design:type", Array)
    ], User.prototype, "suggestions", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Userform_1.Userform; }, function (userform) { return userform.user; }),
        __metadata("design:type", Array)
    ], User.prototype, "userforms", void 0);
    User = __decorate([
        typeorm_1.Entity()
    ], User);
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map