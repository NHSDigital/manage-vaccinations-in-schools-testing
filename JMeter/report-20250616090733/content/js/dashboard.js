/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.45215759849906, "KoPercent": 1.547842401500938};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5190069821567106, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.6857142857142857, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.20588235294117646, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3617021276595745, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.017543859649122806, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.17164179104477612, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.6808510638297872, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.32857142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.11, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8771929824561403, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.40350877192982454, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.648936170212766, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6622807017543859, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6770833333333334, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.8421052631578947, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.3991228070175439, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.6354166666666666, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.8421052631578947, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.6194029850746269, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.5212765957446809, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8029197080291971, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.706140350877193, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.46808510638297873, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.2426470588235294, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2132, 33, 1.547842401500938, 1095.418386491558, 0, 14018, 567.0, 2076.4, 4376.449999999999, 9938.640000000007, 3.8506830808354464, 113.974018006391, 4.431654058140438], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 100, 32, 32.0, 9122.810000000003, 159, 36332, 8983.5, 20530.9, 25858.099999999977, 36249.65999999996, 0.793405215845889, 147.03511754050334, 2.443796538174692], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 355.0, 355, 355, 355.0, 355.0, 355.0, 355.0, 2.8169014084507045, 42.69641285211268, 1.7110475352112677], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 2131.9999999999995, 424, 11169, 462.0, 8119.9, 10954.1, 11169.0, 1.0051405760891414, 14.442024703124552, 1.4527422388788376], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 328.0, 328, 328, 328.0, 328.0, 328.0, 328.0, 3.048780487804878, 35.111590129573166, 1.8518959603658536], "isController": false}, {"data": ["2.3 Search by first/last name", 68, 0, 0.0, 2094.0882352941176, 824, 8491, 1625.5, 4046.3, 4723.749999999999, 8491.0, 0.5396696904041967, 31.008717302365817, 0.46538295467171414], "isController": false}, {"data": ["5.8 Consent confirm", 47, 0, 0.0, 1693.1489361702127, 899, 6026, 1306.0, 3159.600000000006, 4928.999999999999, 6026.0, 0.32299519630548473, 27.218861834939144, 0.7018206169723668], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 159.60000000000002, 152, 186, 158.0, 168.9, 178.0, 186.0, 1.178867949948635, 7.104291131965847, 0.7103139893733476], "isController": false}, {"data": ["3.0 Nurse triage", 114, 0, 0.0, 2192.0438596491226, 1277, 5013, 2074.0, 2799.0, 3341.5, 4953.449999999998, 0.3038727785966942, 35.934559564395705, 0.9059618498055482], "isController": true}, {"data": ["2.4 Patient attending session", 67, 0, 0.0, 2747.746268656716, 972, 8128, 2025.0, 5661.6, 7379.399999999996, 8128.0, 0.5276920168861445, 26.346413011053965, 0.7843234860358516], "isController": false}, {"data": ["5.4 Consent route", 47, 0, 0.0, 754.1489361702127, 429, 4721, 518.0, 1039.2000000000003, 2571.799999999999, 4721.0, 0.3265703168426904, 3.7150359140494724, 0.5080337057914119], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 470.15714285714284, 445, 709, 463.5, 480.9, 504.9, 709.0, 1.1799012254117012, 6.08962692998129, 0.6394972461948185], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 2435.985714285714, 536, 10900, 796.0, 7669.4, 9606.850000000002, 10900.0, 0.9847781435525168, 9.556387121563828, 1.5492945207647506], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 3939.0, 3939, 3939, 3939.0, 3939.0, 3939.0, 3939.0, 0.2538715410002539, 2522.8407531257935, 0.15891763455191674], "isController": false}, {"data": ["2.1 Open session", 100, 32, 32.0, 2430.8400000000006, 157, 13249, 1429.5, 7647.500000000009, 10067.8, 13231.23999999999, 0.7701846132517965, 10.078384636453608, 0.4677442472023044], "isController": false}, {"data": ["3.3 Nurse triage complete", 114, 0, 0.0, 478.94736842105266, 305, 1276, 395.0, 826.5, 918.25, 1265.6499999999996, 0.305199638043938, 7.165080208606629, 0.20673970821308288], "isController": false}, {"data": ["4.3 Vaccination confirm", 114, 0, 0.0, 1284.3070175438597, 850, 3030, 1156.0, 2017.5, 2267.5, 3022.2, 0.36766958759727925, 9.223352043025406, 0.8558547753506569], "isController": false}, {"data": ["5.6 Consent questions", 47, 0, 0.0, 704.9148936170214, 443, 3508, 547.0, 894.8000000000001, 1883.399999999992, 3508.0, 0.32338856167776736, 3.8838006735254855, 0.6271969565352011], "isController": false}, {"data": ["4.1 Vaccination questions", 114, 0, 0.0, 736.6140350877191, 451, 12029, 545.0, 868.0, 958.75, 10412.89999999994, 0.33137608278588454, 3.841653010726121, 0.6986359123379455], "isController": false}, {"data": ["5.3 Consent parent details", 48, 1, 2.0833333333333335, 695.8749999999998, 288, 4141, 513.5, 749.0000000000001, 2813.5999999999963, 4141.0, 0.34567189975514906, 3.9409494049762346, 0.5692629379410917], "isController": false}, {"data": ["3.1 Nurse triage new", 114, 0, 0.0, 467.98245614035085, 270, 2561, 349.0, 700.5, 1041.25, 2465.7499999999964, 0.3054064987288124, 3.428377362212107, 0.21045881633549707], "isController": false}, {"data": ["3.2 Nurse triage result", 114, 0, 0.0, 1245.1140350877192, 586, 2794, 1220.0, 1672.5, 2055.0, 2775.399999999999, 0.30598523218642554, 25.565970978038848, 0.4941303971835938], "isController": false}, {"data": ["5.2 Consent who", 48, 0, 0.0, 706.6875, 446, 3263, 556.0, 1181.3000000000002, 1564.5999999999985, 3263.0, 0.35520298370506315, 5.312745994253852, 0.5530462471509762], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 6253.142857142858, 1881, 22566, 4838.0, 13654.699999999999, 16252.600000000002, 22566.0, 1.015950421619425, 191.43848034680195, 4.863394920792151], "isController": true}, {"data": ["5.0 Consent", 48, 1, 2.0833333333333335, 8028.145833333333, 2282, 14840, 7684.0, 10372.900000000001, 11034.8, 14840.0, 0.32477857543997346, 65.35560267358738, 4.787266068504597], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 95, 0, 0.0, 542.4315789473684, 302, 4721, 387.0, 766.0000000000002, 1020.7999999999954, 4721.0, 0.40646754035794813, 8.961827917955597, 0.29382405330500894], "isController": false}, {"data": ["4.0 Vaccination", 114, 0, 0.0, 2614.6491228070176, 1839, 14057, 2398.5, 3231.5, 3862.0, 12570.649999999943, 0.3036599009109797, 16.313876895377177, 1.829487432409035], "isController": true}, {"data": ["2.5 Patient return to consent page", 67, 0, 0.0, 1321.7761194029842, 310, 9106, 581.0, 3984.2000000000016, 6283.199999999996, 9106.0, 0.5500098509227032, 12.167813546660536, 0.38135448647960857], "isController": false}, {"data": ["5.5 Consent agree", 47, 0, 0.0, 958.6382978723404, 459, 5318, 584.0, 1835.6000000000024, 3795.199999999998, 5318.0, 0.3199106972691878, 5.554679470326581, 0.49173773193525555], "isController": false}, {"data": ["Debug Sampler", 182, 0, 0.0, 0.2857142857142857, 0, 4, 0.0, 1.0, 1.0, 1.5099999999999625, 0.387947205074861, 1.2553933087899884, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 137, 0, 0.0, 701.970802919708, 267, 9130, 327.0, 1068.8, 2352.799999999993, 8045.860000000013, 0.26937483409852825, 2.9168243754731265, 0.16781202687358063], "isController": false}, {"data": ["4.2 Vaccination batch", 114, 0, 0.0, 593.7280701754388, 442, 1381, 511.5, 796.0, 848.25, 1315.5999999999976, 0.33688839242178426, 5.742317134616464, 0.5352218522729623], "isController": false}, {"data": ["5.7 Consent triage", 47, 0, 0.0, 1227.3617021276593, 462, 9580, 905.0, 2223.8000000000065, 4245.4, 9580.0, 0.3272501932168694, 5.3378812007819185, 0.5407570097687664], "isController": false}, {"data": ["2.2 Session register", 68, 0, 0.0, 3732.4411764705887, 678, 14018, 1593.0, 9888.3, 11136.499999999996, 14018.0, 0.5542559521383684, 68.0161648646556, 0.34196044864166536], "isController": false}, {"data": ["5.1 Consent homepage", 48, 0, 0.0, 854.3958333333331, 603, 1275, 905.5, 1062.5, 1119.1499999999999, 1275.0, 0.3483890634866487, 4.378544280340696, 0.7420278783831845], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 59.0, 59, 59, 59.0, 59.0, 59.0, 59.0, 16.949152542372882, 0.11586334745762712, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 3.0303030303030303, 0.04690431519699812], "isController": false}, {"data": ["404/Not Found", 32, 96.96969696969697, 1.5009380863039399], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2132, 33, "404/Not Found", 32, "422/Unprocessable Entity", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 100, 32, "404/Not Found", 32, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.3 Consent parent details", 48, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
