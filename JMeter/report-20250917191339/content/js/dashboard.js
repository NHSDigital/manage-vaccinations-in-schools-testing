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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6582497175892086, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9234449760765551, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.8939393939393939, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.7457457457457457, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9015151515151515, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.015527950310559006, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.03955696202531646, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9929577464788732, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.5, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.39568345323741005, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9929577464788732, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.49295774647887325, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.005050505050505051, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.2627627627627628, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3713733075435203, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7761121856866537, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.030303030303030304, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9287974683544303, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.906832298136646, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8699226305609284, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.6826826826826827, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12940, 0, 0.0, 576.794899536322, 0, 10687, 354.0, 1432.0, 2031.949999999999, 3592.260000000002, 4.459221214589855, 107.63676033174245, 3.877252489315444], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 999, 0, 0.0, 4375.444444444439, 1553, 16301, 3976.0, 6622.0, 7620.0, 9935.0, 0.3830490628718097, 86.77618182222746, 1.5055315918899808], "isController": true}, {"data": ["2.5 Select patient", 836, 0, 0.0, 339.3720095693779, 149, 4941, 202.0, 554.6000000000001, 1073.8999999999999, 2447.8199999999997, 0.3215399455689795, 7.401647367579197, 0.22355421688484717], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.2022022022022024, 0, 57, 0.0, 1.0, 1.0, 1.0, 0.3836012206121723, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 198, 0, 0.0, 375.2474747474749, 150, 2487, 218.5, 681.1999999999998, 944.1999999999999, 2295.9299999999985, 0.07689562273609384, 1.8123036710086804, 0.05767171705207038], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 645.139139139139, 278, 7185, 475.0, 1029.0, 1664.0, 3739.0, 0.38348076934149944, 23.110326249551356, 0.2997480468487593], "isController": false}, {"data": ["2.5 Select td_ipv", 198, 0, 0.0, 393.5454545454546, 157, 3246, 285.0, 617.1999999999999, 870.0499999999996, 2537.1599999999935, 0.07705734350645939, 1.901196273907722, 0.0537294367808711], "isController": false}, {"data": ["4.0 Vaccination for flu", 322, 0, 0.0, 2512.282608695653, 1402, 11517, 1966.0, 4340.799999999999, 5075.4, 8438.109999999999, 0.12404099362228979, 5.664472248187152, 0.7487154973668254], "isController": true}, {"data": ["4.0 Vaccination for hpv", 316, 0, 0.0, 2545.566455696204, 1400, 8654, 2109.5, 4187.1, 4898.999999999998, 7857.769999999987, 0.12170627576870416, 5.295720704076583, 0.737453884731447], "isController": true}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 1083.0, 1083, 1083, 1083.0, 1083.0, 1083.0, 1083.0, 0.9233610341643582, 68.3215027700831, 2.007228185595568], "isController": false}, {"data": ["1.2 Sign-in page", 71, 0, 0.0, 122.94366197183099, 97, 1061, 104.0, 113.8, 169.5999999999995, 1061.0, 0.02777990800546521, 0.17000788633928893, 0.017031547362395552], "isController": false}, {"data": ["Get correct patient name", 999, 0, 0.0, 0.27927927927927915, 0, 48, 0.0, 1.0, 1.0, 1.0, 0.3835490844925231, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 1, 0, 0.0, 604.0, 604, 604, 604.0, 604.0, 604.0, 604.0, 1.6556291390728477, 40.84747516556291, 1.2352545529801324], "isController": false}, {"data": ["2.4 Patient attending session", 834, 0, 0.0, 1243.6474820143892, 622, 6924, 960.0, 2157.5, 2828.0, 4756.599999999996, 0.3205539664517597, 19.580844099500872, 0.47707445788328295], "isController": false}, {"data": ["6.1 Logout", 3, 0, 0.0, 118.66666666666667, 104, 141, 111.0, 141.0, 141.0, 141.0, 0.015848195418814978, 0.075433695772758, 0.011623041757353562], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 125.0, 125, 125, 125.0, 125.0, 125.0, 125.0, 8.0, 38.078125, 5.84375], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 614.0, 614, 614, 614.0, 614.0, 614.0, 614.0, 1.6286644951140066, 20.137227707654723, 2.5336548249185666], "isController": false}, {"data": ["1.1 Homepage", 71, 0, 0.0, 317.71830985915494, 290, 995, 305.0, 336.59999999999997, 351.59999999999997, 995.0, 0.027780799320113847, 0.15865440861721267, 0.015370687079815409], "isController": false}, {"data": ["1.3 Sign-in", 71, 0, 0.0, 671.0281690140844, 554, 2568, 601.0, 781.9999999999999, 987.799999999999, 2568.0, 0.027827302973876433, 0.4144126285885953, 0.06133458471277716], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 198, 0, 0.0, 2485.4949494949515, 1445, 10821, 2033.0, 4097.099999999999, 4713.649999999999, 9347.879999999986, 0.07700669530434173, 3.7225816330524015, 0.4676506856707264], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 1717.1541541541528, 551, 6517, 1465.0, 2869.0, 3491.0, 4811.0, 0.3835536495187342, 6.193658658848417, 0.251814315064943], "isController": false}, {"data": ["4.3 Vaccination confirm", 1034, 0, 0.0, 1403.8404255319151, 668, 10687, 1054.5, 2489.0, 3479.5, 5438.200000000003, 0.3831785363691647, 7.7529811997703515, 0.8921309571940658], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 303.0, 303, 303, 303.0, 303.0, 303.0, 303.0, 3.3003300330033003, 38.653181724422446, 8.131574876237623], "isController": false}, {"data": ["4.1 Vaccination questions", 1034, 0, 0.0, 606.7292069632496, 246, 3891, 482.0, 974.5, 1586.25, 2787.5500000000006, 0.38302013226418613, 4.366467346214082, 0.8079746920327366], "isController": false}, {"data": ["5.3 Consent parent details", 1, 0, 0.0, 306.0, 306, 306, 306.0, 306.0, 306.0, 306.0, 3.2679738562091503, 34.77328431372549, 5.910437091503268], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 1, 0, 0.0, 355.0, 355, 355, 355.0, 355.0, 355.0, 355.0, 2.8169014084507045, 40.283890845070424, 4.384903169014085], "isController": false}, {"data": ["1.0 Login", 71, 0, 0.0, 1792.3239436619717, 1610, 5333, 1692.0, 1903.6, 2115.0, 5333.0, 0.02773371415759234, 1.3761341251976027, 0.11007161120867823], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 198, 0, 0.0, 2456.9595959595977, 1446, 7156, 2061.5, 3884.8, 4450.999999999996, 6858.999999999997, 0.07686201133908764, 3.6376704344741646, 0.4659964148044774], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 1476.0, 1476, 1476, 1476.0, 1476.0, 1476.0, 1476.0, 0.6775067750677507, 17.60525173611111, 0.4413056825880759], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 1367.0, 1367, 1367, 1367.0, 1367.0, 1367.0, 1367.0, 0.731528895391368, 13.031787216532553, 0.47649391916605705], "isController": false}, {"data": ["2.5 Select hpv", 316, 0, 0.0, 305.96202531645554, 149, 3083, 200.0, 524.0000000000001, 927.7999999999993, 2320.0599999999954, 0.12177240506280335, 2.738704606903455, 0.09085363033982594], "isController": false}, {"data": ["2.5 Select flu", 322, 0, 0.0, 361.76708074534173, 150, 3911, 207.5, 630.3999999999997, 1296.899999999996, 2481.979999999993, 0.12410821311153165, 2.87942888300681, 0.09259636212618182], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 817.0, 817, 817, 817.0, 817.0, 817.0, 817.0, 1.2239902080783354, 14.564766294369646, 2.6033697980416157], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 340.0, 340, 340, 340.0, 340.0, 340.0, 340.0, 2.941176470588235, 48.84248621323529, 4.520909926470588], "isController": false}, {"data": ["Debug Sampler", 1836, 0, 0.0, 1.1503267973856222, 0, 13, 1.0, 2.0, 2.0, 3.0, 0.6794531660260095, 9.858632828213628, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 75, 0, 0.0, 685.5999999999999, 638, 958, 670.0, 746.2, 785.8000000000002, 958.0, 0.029413333416997926, 0.6734619289989584, 0.0176805538697358], "isController": false}, {"data": ["4.2 Vaccination batch", 1034, 0, 0.0, 496.16150870406165, 254, 5053, 319.0, 932.0, 1490.5, 2576.6000000000004, 0.3831613553980913, 5.442718654070701, 0.6197979141144193], "isController": false}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 813.0, 813, 813, 813.0, 813.0, 813.0, 813.0, 1.2300123001230012, 19.623741159286595, 2.036006688191882], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 5235.0, 5235, 5235, 5235.0, 5235.0, 5235.0, 5235.0, 0.19102196752626552, 36.70326677411652, 2.984531697707736], "isController": true}, {"data": ["2.2 Session register", 999, 0, 0.0, 686.0780780780774, 274, 4033, 541.0, 1047.0, 1498.0, 2953.0, 0.3835851658900251, 24.501728203080123, 0.2552063604919182], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 106.0, 106, 106, 106.0, 106.0, 106.0, 106.0, 9.433962264150942, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12940, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
